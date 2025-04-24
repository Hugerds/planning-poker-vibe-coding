const Player = require('./Player');

class Game {
    constructor(id, name, moderatorId, deckType = 'fibonacci', customDeckValues = null, settings = {}) {
        this.id = id; // Room ID
        this.name = name || `Sala #${id.substring(0, 4)}`; // Default name if none provided
        this.moderatorId = moderatorId;
        this.players = []; // Array of Player objects
        this.currentRound = {
            status: 'waiting', // 'waiting', 'voting', 'revealed'
            votes: {}, // { playerId: voteValue }
            results: null // { average: ..., distribution: ..., majority: ..., voteCount: ... }
        };
        this.deckType = deckType;
        this.customDeckValues = null; // Initialize custom deck values

        // Validate and store custom deck values if provided and deckType is 'custom'
        if (deckType === 'custom' && Array.isArray(customDeckValues) && customDeckValues.length > 0) {
             // Optional: Further validation/sanitization if needed
             this.customDeckValues = customDeckValues.map(String); // Ensure all are strings
             console.log(`Game ${this.id} created with custom deck:`, this.customDeckValues);
         } else {
            // If not custom or invalid, ensure deckType is a standard one or default
            const standardDecks = ['fibonacci', 'modified_fibonacci', 'tshirt'];
            if (!standardDecks.includes(deckType)) {
                console.warn(`Invalid standard deckType '${deckType}' provided for game ${this.id}. Defaulting to 'fibonacci'.`);
                this.deckType = 'fibonacci';
            }
         }

        this.settings = { // Default settings, merge with provided ones
            autoReveal: true,
            showAverage: true,
            ...settings
        }; 
    }

    addPlayer(player) {
        this.players.push(player);
    }

    removePlayer(playerId) {
        const initialLength = this.players.length;
        this.players = this.players.filter(p => p.id !== playerId);
        console.log(`Player ${playerId} removed. Players remaining: ${this.players.length}/${initialLength}`);
        // Simple moderator reassignment if moderator leaves
        if (this.moderatorId === playerId && this.players.length > 0) {
            this.moderatorId = this.players.find(p => !p.isSpectator)?.id || this.players[0].id;
        }
        delete this.currentRound.votes[playerId];
    }

    promoteNewModerator(disconnectedModeratorId) {
        // Find the first non-spectator player who isn't the one leaving
        const nextModerator = this.players.find(p => !p.isSpectator && p.id !== disconnectedModeratorId);

        if (nextModerator) {
            this.moderatorId = nextModerator.id;
            console.log(`Promoted new moderator: ${nextModerator.name} (${this.moderatorId}) in game ${this.id}`);
            return true;
        } else {
            console.log(`Could not promote a new moderator in game ${this.id}. No suitable players found.`);
            // Optional: handle case where room might become unusable or close
            this.moderatorId = null; // Indicate no moderator
            return false;
        }
    }

    startNewRound() {
        // Reset votes and statuses for the new round
        this.currentRound.votes = {};
        this.currentRound.results = null;
        this.players.forEach(p => p.resetVote());
        this.currentRound.status = 'voting'; // Set status to voting

        console.log(`New round started for game ${this.id}. Status: ${this.currentRound.status}`);
    }

    submitVote(playerId, voteValue) {
        const player = this.players.find(p => p.id === playerId);
        if (player && this.currentRound.status === 'voting' && !player.isSpectator) {
            this.currentRound.votes[playerId] = voteValue;
            console.log(`Vote registered for ${playerId} in game ${this.id}.`);

            // Mark the player as having voted
            const player = this.getPlayer(playerId);
            if (player) {
                player.setVoted();
            }

            // Check for auto-reveal
            if (this.settings.autoReveal && this.currentRound.status === 'voting') {
                const activePlayersCount = this.players.filter(p => !p.isSpectator).length;
                const votesCount = Object.keys(this.currentRound.votes).length;
                console.log(`Auto-reveal check: ${votesCount}/${activePlayersCount} votes.`); // Log for debugging
                if (votesCount === activePlayersCount) {
                    console.log(`All active players have voted. Auto-revealing votes for game ${this.id}.`);
                    this.revealVotes(); // Reveal votes automatically
                }
            }

            return true;
        }
        return false;
    }

    revealVotes() {
        if (this.currentRound.status !== 'voting') {
            console.log(`Attempted to reveal votes when status was ${this.currentRound.status}`);
            return false;
        }
        
        this.currentRound.status = 'revealed';
        
        // Calculate Metrics
        const votes = Object.values(this.currentRound.votes);
        let sum = 0;
        let numericVoteCount = 0;
        const distribution = {};
        let majorityVotes = [];
        let maxFrequency = 0;

        votes.forEach(vote => {
            // Calculate distribution for all votes
            distribution[vote] = (distribution[vote] || 0) + 1;

            // Prepare for average calculation (only numeric)
            const numericValue = this._parseNumericVote(vote);
            if (numericValue !== null) {
                sum += numericValue;
                numericVoteCount++;
            }
        });

        // Determine majority vote(s)
        for (const vote in distribution) {
            if (distribution[vote] > maxFrequency) {
                maxFrequency = distribution[vote];
                majorityVotes = [vote]; // Start new list with the highest
            } else if (distribution[vote] === maxFrequency) {
                majorityVotes.push(vote); // Add to list of ties
            }
        }

        // Calculate average
        const average = numericVoteCount > 0 ? (sum / numericVoteCount) : null;

        this.currentRound.results = {
            average: average !== null ? parseFloat(average.toFixed(2)) : null, // Store average or null, rounded
            distribution: distribution,      // Store map of vote counts
            majority: majorityVotes,       // Store array of vote(s) with highest frequency
            voteCount: votes.length          // Store total number of votes submitted
        };

        console.log(`Votes revealed for game ${this.id}. Results:`, this.currentRound.results);
        return true;
    }
    
    // Helper to parse numeric votes, handling specific cases
    _parseNumericVote(vote) {
        if (vote === '½') return 0.5;
        const number = parseFloat(vote);
        return !isNaN(number) && isFinite(number) ? number : null;
    }

    allPlayersVoted() {
        const votingPlayers = this.players.filter(p => !p.isSpectator && p.isConnected);
        return votingPlayers.length > 0 && votingPlayers.every(p => p.hasVoted);
    }

    getPlayer(playerId) {
        return this.players.find(p => p.id === playerId);
    }

    /**
     * Returns a plain object representation of the game state suitable for serialization and sending to clients.
     * @returns {object} Serializable game state.
     */
    getSerializableState() {
        return {
            id: this.id,
            name: this.name,
            moderatorId: this.moderatorId,
            players: this.players.map(player => player.getSerializableState ? player.getSerializableState() : { ...player }), // Ensure players are also serializable
            currentRound: {
                status: this.currentRound.status,
                // Only send votes if status is 'revealed'
                votes: this.currentRound.status === 'revealed' ? this.currentRound.votes : {},
                results: this.currentRound.status === 'revealed' ? this.currentRound.results : null // Send results ONLY when revealed
            },
            deckType: this.deckType,
            customDeckValues: this.customDeckValues, // Send custom deck values if set
            settings: this.settings
            // Add any other state needed by the client
        };
    }
}

module.exports = Game;

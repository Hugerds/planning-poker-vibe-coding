class Player {
    constructor(id, name, isSpectator = false) {
        this.id = id; // Corresponds to socket.id initially
        this.name = name;
        this.isSpectator = isSpectator;
        this.isConnected = true;
        this.hasVoted = false;
        this.vote = null;
    }

    // Method to mark player as having voted
    setVoted() {
        if (!this.isSpectator) {
            this.hasVoted = true;
        }
    }

    // Method to reset vote status (e.g., for new round)
    resetVote() {
        this.hasVoted = false;
    }

    // Method to get serializable state (important for sending to client)
    getSerializableState() {
        return {
            id: this.id,
            name: this.name,
            isSpectator: this.isSpectator,
            hasVoted: this.hasVoted
        };
    }
}

module.exports = Player;

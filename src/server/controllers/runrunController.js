const runrunService = require('../services/runrunService');

const handleGetBoards = async (req, res) => {
    const appKey = req.headers['app-key'];
    const userToken = req.headers['user-token'];

    if (!appKey || !userToken) {
        return res.status(400).json({ message: 'App-Key and User-Token headers are required' });
    }

    try {
        const boards = await runrunService.getBoards(appKey, userToken);
        if (boards === null) {
            // Assuming service layer handled the error logging
            return res.status(500).json({ message: 'Failed to fetch boards from RunRun.it' });
        }
        res.json(boards);
    } catch (error) {
        console.error('Error in handleGetBoards controller:', error);
        res.status(500).json({ message: 'Internal server error while fetching boards' });
    }
};

const handleGetTasksByBoard = async (req, res) => {
    const appKey = req.headers['app-key'];
    const userToken = req.headers['user-token'];
    const { boardId } = req.params;

    if (!appKey || !userToken) {
        return res.status(400).json({ message: 'App-Key and User-Token headers are required' });
    }
    if (!boardId) {
        return res.status(400).json({ message: 'Board ID parameter is required' });
    }

    try {
        const tasks = await runrunService.getTasksByBoard(boardId, appKey, userToken);
        if (tasks === null) {
            return res.status(500).json({ message: 'Failed to fetch tasks from RunRun.it' });
        }
        res.json(tasks);
    } catch (error) {
        console.error('Error in handleGetTasksByBoard controller:', error);
        res.status(500).json({ message: 'Internal server error while fetching tasks' });
    }
};

const handleGetTaskDescription = async (req, res) => {
    const appKey = req.headers['app-key'];
    const userToken = req.headers['user-token'];
    const { taskId } = req.params;

    if (!appKey || !userToken) {
        return res.status(400).json({ message: 'App-Key and User-Token headers are required' });
    }
    if (!taskId) {
        return res.status(400).json({ message: 'Task ID parameter is required' });
    }

    try {
        const description = await runrunService.getTaskDescription(taskId, appKey, userToken);
        if (description === null) {
            return res.status(500).json({ message: 'Failed to fetch task description from RunRun.it' });
        }
        // The description endpoint seems to return the description directly, possibly as plain text or HTML
        // Adjust content type if necessary, but assuming JSON is fine for now
        res.json(description); 
    } catch (error) {
        console.error('Error in handleGetTaskDescription controller:', error);
        res.status(500).json({ message: 'Internal server error while fetching task description' });
    }
};

module.exports = {
    handleGetBoards,
    handleGetTasksByBoard,
    handleGetTaskDescription
};

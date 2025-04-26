const axios = require('axios');

const runrunAPI = axios.create({
    baseURL: 'https://runrun.it/api/v1.0',
    headers: {
        'Content-Type': 'application/json'
    }
});

const getBoards = async (appKey, userToken) => {
    if (!appKey || !userToken) {
        console.error('RunRun Service: App Key or User Token missing for getBoards');
        return null;
    }
    try {
        const response = await runrunAPI.get('/boards?page=1&limit=100', {
            headers: {
                'App-Key': appKey,
                'User-Token': userToken
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching RunRun boards:', error.response ? error.response.data : error.message);
        return null;
    }
};

const getTasksByBoard = async (boardId, appKey, userToken) => {
    if (!boardId || !appKey || !userToken) {
        console.error('RunRun Service: Board ID, App Key or User Token missing for getTasksByBoard');
        return null;
    }
    try {
        const response = await runrunAPI.get(`/boards/${boardId}/tasks?limit=100&group_by=board_stage`, {
            headers: {
                'App-Key': appKey,
                'User-Token': userToken
            }
        });
        return response.data;
    } catch (error) {
        console.error(`Error fetching RunRun tasks for board ${boardId}:`, error.response ? error.response.data : error.message);
        return null;
    }
};

const getTaskDescription = async (taskId, appKey, userToken) => {
    if (!taskId || !appKey || !userToken) {
        console.error('RunRun Service: Task ID, App Key or User Token missing for getTaskDescription');
        return null;
    }
    try {
        const response = await runrunAPI.get(`/tasks/${taskId}/description`, {
            headers: {
                'App-Key': appKey,
                'User-Token': userToken
            }
        });
        return response.data;
    } catch (error) {
        console.error(`Error fetching RunRun description for task ${taskId}:`, error.response ? error.response.data : error.message);
        return null;
    }
};

module.exports = {
    getBoards,
    getTasksByBoard,
    getTaskDescription
};

const { tasks, users } = require('../constants');

module.exports = {
    Query: {
        tasks: () => tasks,
        //Destructured way of passing args.id
        task: (_, { id }) => tasks.find(task => task.id === id)
    },
    Mutation: {
        createTask: (_, { input }) => {
            const task = { ...input, id: uuid.v4() };
            tasks.push(task);
            return task;
        }
    },
    Task: {
        user: (parent) => users.find(user => user.id === parent.userId)
        //Alternate way could be --> user: ({userId}) => users.find(user => user.id === userId)
    }
}
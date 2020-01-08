const express = require('express');
const { ApolloServer, gql } = require('apollo-server-express');
const cors = require('cors');
const dotEnv = require('dotenv');
const uuid = require('uuid');

const { tasks, users } = require('./constants');

dotEnv.config();

const app = express();

//enable cors
app.use(cors());

//body parser middleware
app.use(express.json());

//The use of two '!' in the code below denotes that the greetings modifier cannot be null and also the value inside the modifier cannot be null either
const typeDefs = gql`
    type Query {
        greetings: [String!]
        tasks: [Task!]
        task(id: ID!): Task
        users: [User!]
        user(id: ID!): User
    }

    input createTaskInput {
        name: String!
        completed: Boolean!
        userID: ID!
    }

    type Mutation {
        createTask(input: createTaskInput!): Task
    }

    type User {
        id: ID!
        name: String!
        email: String!
        tasks: [Task!]
    }

    type Task {
        id: ID!
        name: String!
        completed: Boolean!
        user: User!
    }
`;

// In the code below the value of greetings can be null, only if the list is defined then the value inside the list CANNOT be null
// const typeDefs = gql`
//     type Query {
//         greetings: [String!]
//     }
// `;

//GraphQL will not move to Field level Resolver (Task in this case) until theQuery level resolver has finished executing
//Field Level resolver is given a higher priority over a Query resolver. Hence we can overwrite a property value of a Query resolver using a Field Level Resolver
const resolvers = {
    Query: {
        greetings: () => ["Hello", "Hi How are you ?"],
        tasks: () => tasks,
        //Destructured way of passing args.id
        task: (_, { id }) => tasks.find(task => task.id === id),
        users: () => users,
        user: (_, { id }) => users.find(user => user.id === id)
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
    },
    User: {
        tasks: ({ id }) => tasks.filter(task => task.userId === id)
    }
};

const apolloServer = new ApolloServer({
    typeDefs,
    resolvers
});

apolloServer.applyMiddleware({ app, path: '/graphql' });


const PORT = process.env.PORT || 3000;

app.use('/', (req, res, next) => {
    res.send({ message: 'Hello Lads!' });
});

app.listen(PORT, () => {
    console.log(`Server listening on PORT: ${PORT}`);
    console.log(`Graphql Endpoint: ${apolloServer.graphqlPath}`);
});
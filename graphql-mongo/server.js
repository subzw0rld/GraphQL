const express = require('express');
const { ApolloServer, gql } = require('apollo-server-express');
const cors = require('cors');
const dotEnv = require('dotenv');

const resolvers = require('./resolvers');
const typeDefs = require('./typeDefs');
const { connection } = require('./database/util');
const { verifyUser } = require('./helper/context');

dotEnv.config();

const app = express();

connection();

//enable cors
app.use(cors());

//body parser middleware
app.use(express.json());



// In the code below the value of greetings can be null, only if the list is defined then the value inside the list CANNOT be null
// const typeDefs = gql`
//     type Query {
//         greetings: [String!]
//     }
// `;

//GraphQL will not move to Field level Resolver (Task in this case) until theQuery level resolver has finished executing
//Field Level resolver is given a higher priority over a Query resolver. Hence we can overwrite a property value of a Query resolver using a Field Level Resolver


const apolloServer = new ApolloServer({
    typeDefs,
    resolvers,
    context: async ({ req }) => {
        await verifyUser(req);
        return {
            email: req.email,
            loggedInUserId: req.loggedInUserId
        }
    }
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
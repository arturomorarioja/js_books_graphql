// GraphQL Books server using Apollo Server v5 (standalone).

const { readFileSync, writeFileSync } = require('fs');
const path = require('path');
const { ApolloServer } = require('@apollo/server');
const { startStandaloneServer } = require('@apollo/server/standalone');

const DATA_FILE = path.join(__dirname, 'books_data.json');

/**
 * Loads books from JSON file.
 */
function loadBooks() {
    const raw = readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(raw);
}

/**
 * Saves books to JSON file.
 */
function saveBooks(books) {
    writeFileSync(DATA_FILE, JSON.stringify(books, null, 2), 'utf-8');
}

let booksData = loadBooks();

/**
 * GraphQL type definitions.
 */
const typeDefs = `#graphql
    type Book {
        title: String!
        author: String!
    }

    type AddBookPayload {
        success: Boolean!
        book: Book
    }

    type Query {
        books: [Book!]!
        book(title: String!): Book
    }

    type Mutation {
        addBook(title: String!, author: String!): AddBookPayload!
    }
`;

/**
 * Resolver implementations.
 */
const resolvers = {
    Query: {
        books: () => booksData,
        book: (_, { title }) =>
            booksData.find((b) => b.title === title) || null
    },
    Mutation: {
        addBook: (_, { title, author }) => {
            const newBook = { title, author };
            booksData.push(newBook);
            saveBooks(booksData);

            return {
                success: true,
                book: newBook
            };
        }
    }
};

async function start() {
    const server = new ApolloServer({
        typeDefs,
        resolvers
    });

    const { url } = await startStandaloneServer(server, {
        listen: { port: 4000 }
    });

    console.log('GraphQL Books API running at', url);
}

start().catch(console.error);
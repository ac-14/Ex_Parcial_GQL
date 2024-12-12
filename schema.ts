export const schema = `#graphql
  type Friend {
    id: ID!
    name: String!
    email: String!
    number: String!
  }

  type Person {
    id: ID!
    name: String!
    email: String!
    number: String!
    friends: [Friend!]!
  }

  type Query {
    getPersonas: [Person!]!
    getPersonabyMail(email: String!): Person
    getPersonabyPhone(number: String!): Person 
  }

  type Mutation {
    addPersona(name: String!, email: String!, number: String!, friends: [ID!]):Person
  }
`;
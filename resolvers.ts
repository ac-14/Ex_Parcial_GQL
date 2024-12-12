import { Collection, ObjectId } from "mongodb";
import { Person, PersonModel } from "./types.ts";
import { fromIdtoFriend, fromModeltoPerson } from "./utils.ts";

export const resolvers = {
    Query: {
      getPersonas: async (_:unknown, __:unknown, context: {personsCollection: Collection<PersonModel>}):Promise<Person[]> => {
        const personsDB = await context.personsCollection.find().toArray();
        const persons = await Promise.all(personsDB.map((p) => fromModeltoPerson(p,context.personsCollection)));
        return persons;

      },

      getPersonabyMail: async (_:unknown, {email}: {email: string}, context: {personsCollection: Collection<PersonModel>}):Promise<Person|null> => {
        const personDB = await context.personsCollection.findOne({email});
        if(personDB){
            const person = await fromModeltoPerson(personDB, context.personsCollection)
            return person;
        }
        return null;
        
      },

      getPersonabyPhone: async(_:unknown, {number}: {number:string}, context: {personsCollection: Collection<PersonModel>}):Promise<Person|null> => {
        const personDB = await context.personsCollection.findOne({number});
        if(personDB){
            const person = await fromModeltoPerson(personDB, context.personsCollection)
            return person;
        }
        return null;
      }
    },

    Mutation: {
        addPersona: async(_:unknown, args: {name: string, email: string, number: string, friends?: String[] }, context: {personsCollection: Collection<PersonModel>}):Promise<Person|null> => {
            const friendsID = args.friends?.map((f)=> new ObjectId(f));
            const personWithMail = await context.personsCollection.findOne({email: args.email});
            const personWithNumber = await context.personsCollection.findOne({number: args.number});
            if(!personWithMail && !personWithNumber){
                if(friendsID){
                    const {insertedId} = await context.personsCollection.insertOne({
                        name: args.name,
                        email: args.email,
                        number: args.number,
                        friends: friendsID
                    })

                    return {
                        id: insertedId,
                        name: args.name,
                        email: args.email,
                        number: args.number,
                        friends: await Promise.all(friendsID?.map((f) => fromIdtoFriend(f,context.personsCollection)))
                    }
                }
                const {insertedId} = await context.personsCollection.insertOne({
                    name: args.name,
                    email: args.email,
                    number: args.number,
                    friends:[]
                })

                return {
                    id: insertedId,
                    name: args.name,
                    email: args.email,
                    number: args.number,
                    friends: []
                }
            }

            throw new Error("Person already exists");
        }
            
    }
};
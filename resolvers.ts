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
        },
            
        deletePersona: async(_:unknown, {email}:{email: string}, context : {personsCollection: Collection<PersonModel>} ):Promise<string> => {
            const {deletedCount} = await context.personsCollection.deleteOne({email});
            if(deletedCount > 0){
                return ("Person deleted")
            } 

            return ("Person not found")
        },

        modifyPersona: async(_:unknown, args: {name?:string, email:string, number?:string, friends?: String[]}, context: {personsCollection: Collection<PersonModel>}):Promise<Person|null> => {
            const findedPerson = await context.personsCollection.findOne({email:args.email});
        
            if(findedPerson) {
                const updateFields: Partial<PersonModel> = {};
                if (args.name) updateFields.name = args.name;
                if (args.number) updateFields.number = args.number;
                if (args.friends) {
                    const friendsID = args.friends.map((f) => new ObjectId(f));
                    updateFields.friends = friendsID;
                }
        
                await context.personsCollection.updateOne(
                    { email: args.email },
                    { $set: updateFields }
                );
        
                const updatedPerson = await context.personsCollection.findOne({email: args.email});
                if (updatedPerson) {
                    return await fromModeltoPerson(updatedPerson, context.personsCollection);
                }
            }
        
            return null;
        }
    }
};
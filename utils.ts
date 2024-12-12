import { Collection, ObjectId } from "mongodb";
import { Friend, Person, PersonModel } from "./types.ts";

export const fromIdtoFriend = async (id: ObjectId, personsCollection: Collection<PersonModel>):Promise<Friend> => {
    const friend = await personsCollection.findOne({_id: id});

    if(friend){
        return {
            id: friend?._id.toString(),
            name: friend?.name,
            email: friend?.email,
            number: friend?.number
        }
    } 
    throw new Error("Friend not found");
}

export const fromModeltoPerson = async (model: PersonModel, personsCollection: Collection<PersonModel>):Promise<Person> => {
    return {
        id: model._id!.toString(),
        name: model.name,
        number: model.number,
        email: model.email,
        friends: await Promise.all(model.friends.map((f) => fromIdtoFriend(f, personsCollection)))
    }
}
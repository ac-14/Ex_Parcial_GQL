import { ObjectId, OptionalId } from "mongodb";

export type PersonModel = OptionalId<{
    name: string,
    email: string,
    number: string,
    friends: ObjectId[]
}>

export type Friend = {
    id: string,
    name: string,
    email: string
    number: string,
}

export type Person = {
    id: string,
    name: string,
    email: string,
    number: string,
    friends: Friend[]
}
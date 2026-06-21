import {SignJWT,jwtVerify} from "jose";
const secret=()=>new TextEncoder().encode(process.env.AUTH_SECRET||"solo-desarrollo-local");
export async function createSession(user:{id:string;name:string;email:string}){return new SignJWT(user).setProtectedHeader({alg:"HS256"}).setIssuedAt().setExpirationTime("7d").sign(secret())}
export async function verifySession(token?:string){if(!token)return null;try{return (await jwtVerify(token,secret())).payload}catch{return null}}

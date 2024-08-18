import { auth } from "express-oauth2-jwt-bearer";
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config({ path: './.env' });

const checkJwt = auth({
  audience: process.env.AUTH0_AUDIENCE,
  issuerBaseURL: process.env.AUTH0_ISSUER,
  tokenSigningAlg: 'RS256'
});

export { checkJwt };

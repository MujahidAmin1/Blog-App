import type { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/user";

// register a new user

export async function register(req: Request, res: Response) {
  try {
    const { name, email, password } = req.body as {
      name: string;
      email: string;
      password: string;
    };
    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Email already exists" });
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const user = new User({ name, email, passwordHash });
    await user.save();
    const token = jwt.sign(
      { userId: String(user._id) },
      process.env.JWT_SECRET as string,
      { expiresIn: "7d" },
    );
    return res
      .status(201)
      .json({ token, user: { id: String(user._id), name, email } });
  } catch (error) {
    return res.status(500).json({ message: "Registration failed" });
  }
}


// Login an existing user

export async function login(req: Request, res: Response) {
    try {
    const {email,password} = req.body as {email: string, password: string};
    if(!email || !password){
        return res.status(400).json({message: "All fields are required"})
    };
     const user = await User.findOne({email});
        if(!user){
            return res.status(400).json({message: "Invalid email or password"})
        };

    const ok = await bcrypt.compare(password, user.passwordHash);
    if(!ok){
        return res.status(400).json({message: "Invalid Credentials"});
    }
        const token = jwt.sign(
            {userId: String(user!._id)},
             process.env.JWT_SECRET as string, 
             {expiresIn: "7d"});
        return res.status(200).json({token, user: {id: String(user._id), name: user.name, email: user.email}});
    } catch (error) {
       return res.status(500).json({message: "Login failed"});
    }

}

export default {register, login};


import { Request, Response } from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import config from "../config";
import { Trip } from "../model/trip.model";

const generateTripPlan = async (req: Request, res: Response) => {
  try {
    const { destination, days, budget, travelers } = req.body;

    // ১. ভ্যালিডেশন
    if (!destination || !days) {
      return res.status(400).json({
        success: false,
        message: "Destination and days are required",
      });
    }

    // ২. জেমিনি সেটআপ
    // const genAI = new GoogleGenerativeAI(config.gemini_api_key as string);

    const genAI = new GoogleGenerativeAI(
      "AIzaSyAj922LClu9QpXRjauToCEqZEkdfyBXKM0",
    );

    // ৩. মডেল সিলেক্ট (gemini-1.5-flash সবচেয়ে ফাস্ট)
    const model = genAI.getGenerativeModel(
      // { model: "gemini-1.5-pro" },
      // { apiVersion: 'v1' }
      { model: "gemini-2.5-flash" },
    );

    // ৪. প্রম্পট (যাতে সরাসরি JSON দেয়)
    const prompt = `Create a ${days}-day travel itinerary for ${destination} for ${travelers || 1} person(s) with a ${budget || "moderate"} budget. 
    Return ONLY a valid JSON object without any markdown formatting or backticks.
    Format:
    {
      "title": "Trip to ${destination}",
      "itinerary": [
        { "day": 1, "activities": ["activity 1", "activity 2"], "locations": ["place 1"] }
      ],
      "estimated_cost": "string",
      "travel_tips": ["tip 1"]
    }`;

    // ৫. কন্টেন্ট জেনারেট করা
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();

    // ৬. ক্লিন আপ (যদি AI ভুল করে ```json টাইপ কিছু দিয়ে দেয়)
    const cleanJson = text.replace(/```json|```/g, "").trim();
    const tripData = JSON.parse(cleanJson);
    // ৭. ডাটাবেসে সেভ করা (এটি আগেরবার মিস হয়েছিল)
    const newTrip = await Trip.create({
      destination,
      days,
      budget,
      travelers,
      plan: tripData, // এআই জেনারেটেড ডাটা
      user: (req as any).user?._id, // যদি অথেন্টিকেশন থাকে
    });

    res.status(200).json({
      success: true,
      message: "Trip plan generated successfully",
      data: tripData,
    });
  } catch (err: any) {
    console.error("Gemini Error Detail:", err);
    res.status(500).json({
      success: false,
      message: "AI failed to generate trip plan",
      error: err.message,
    });
  }
};

export const aiControllers = {
  generateTripPlan,
};

import { Request, Response } from "express";
import config from "../config";
import { Trip } from "../model/trip.model";
import Groq from "groq-sdk";
import { Review } from "../model/review.model";
import { User } from "../model/user.model";

//Groq config.groq_api_key 
const groq = new Groq({
  apiKey: config.groq_api_key as string,
});

// Get User
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Users could not be fetched" });
  }
};

const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await User.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Explorer removed from the database",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Deletion failed" });
  }
};

// generate AI trip
export const generateTripPlan = async (req: Request, res: Response) => {
  try {
    const { destination, days, budget, travelers } = req.body;

    if (!destination || !days) {
      return res.status(400).json({
        success: false,
        message: "Destination and days are required",
      });
    }
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: `Generate a ${days}-day travel itinerary for ${destination} for ${travelers || 1} people with a ${budget || "moderate"} budget. 
          Return ONLY a valid JSON object. 
          Format: {
            "title": "Trip to ${destination}",
            "itinerary": [
              { "day": 1, "activities": ["activity 1", "activity 2"], "locations": ["place 1"] }
            ],
            "estimated_cost": "string",
            "travel_tips": ["tip 1"]
          }`,
        },
      ],
      model: "llama-3.1-8b-instant", 
      response_format: { type: "json_object" }, 
    });

    const aiContent = chatCompletion.choices[0]?.message?.content;
    if (!aiContent) throw new Error("AI response was empty");

    const tripData = JSON.parse(aiContent);

    const newTrip = await Trip.create({
      destination,
      days: Number(days),
      budget,
      travelers: Number(travelers) || 1,
      plan: tripData,
      user: (req as any).user?._id, 
    });

    res.status(200).json({
      success: true,
      message: "Trip plan generated via Groq successfully!",
      data: newTrip,
    });
  } catch (err: any) {
    console.error("Groq Error:", err.message);
    res.status(500).json({
      success: false,
      message: "AI failed to generate plan",
      error: err.message,
    });
  }
};

export const getAllTrips = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?._id;

    const result = await Trip.find({ user: userId })
      .populate("user", "name email image")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "Your trips retrieved successfully",
      count: result.length,
      data: result,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch trips",
      error: err.message,
    });
  }
};

// get public trip
const getPublicTrips = async (req: Request, res: Response) => {
  try {
    const result = await Trip.find()
      .populate("user", "name image")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "Public trips retrieved successfully",
      data: result,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch public trips",
      error: err.message,
    });
  }
};

// Trips details
export const getSingleTripDetails = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid Trip ID format" });
    }

    const trip = await Trip.findById(id).populate("user", "name image");

    if (!trip) {
      return res
        .status(404)
        .json({ success: false, message: "Trip not found in database" });
    }

    const reviews = await Review.find({ trip: id }).populate(
      "user",
      "name image",
    );

    res.status(200).json({
      success: true,
      data: { trip, reviews },
    });
  } catch (err: any) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: err.message });
  }
};

// creat review private
const createReview = async (req: Request, res: Response) => {
  try {
    const { trip, rating, comment } = req.body;
    const userId = (req as any).user?._id;

    const result = await Review.create({
      user: userId,
      trip,
      rating: Number(rating),
      comment,
    });

    res.status(201).json({
      success: true,
      message: "Review submitted successfully",
      data: result,
    });
  } catch (err: any) {
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to create review",
        error: err.message,
      });
  }
};

// get reviews
const getAllReviews = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?._id;

    
    const result = await Review.find({ user: userId })
      .populate("user", "name image")
      .populate("trip", "destination")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "Reviews retrieved successfully",
      data: result,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch reviews",
      error: err.message,
    });
  }
};

export const getAdminDashboardStats = async (req: Request, res: Response) => {
  try {
    const [totalUsers, totalTrips, totalReviews, uniqueDestinations] =
      await Promise.all([
        User.countDocuments(),
        Trip.countDocuments(),
        Review.countDocuments(),
        Trip.distinct("destination"),
      ]);

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const statsByDay = await Trip.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: "%w", date: "$createdAt" } }, 
          count: { $sum: 1 },
        },
      },
    ]);
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    
    const chartData = dayNames.map((day, index) => {
      const dayData = statsByDay.find((d) => parseInt(d._id) === index);
      return { name: day, trips: dayData ? dayData.count : 0 };
    });

    const recentLogs = await Trip.find()
      .populate("user", "name image")
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalTrips,
        totalReviews,
        activeRegions: uniqueDestinations.length,
        serverStatus: "Operational",
        chartData,
        recentLogs: recentLogs.map((log) => ({
          user: {
            name: (log.user as any)?.name || "Explorer",
            image: (log.user as any)?.image,
          },
          destination: log.destination || "Unknown",
          createdAt: log.createdAt,
        })),
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// user role
export const updateUserRole = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { role },
      { new: true, runValidators: true },
    ).select("-password");

    res.status(200).json({
      success: true,
      message: `User role updated to ${role}`,
      data: updatedUser,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// user status
export const updateUserStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true },
    ).select("-password");

    res.status(200).json({
      success: true,
      message: `User status is now ${status}`,
      data: updatedUser,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// get content by Adnmin 
export const getAllContents = async (req: Request, res: Response) => {
  try {
    const contents = await Trip.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "All contents fetched successfully",
      data: contents,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

//delete content
export const deleteContent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await Trip.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Content deleted successfully",
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// update content
export const updateContentStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body; 

    const updatedTrip = await Trip.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true },
    );

    if (!updatedTrip) {
      return res
        .status(404)
        .json({ success: false, message: "Trip not found" });
    }

    res.status(200).json({
      success: true,
      message: `Content is now ${status}`,
      data: updatedTrip,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getSystemStats = async (req: Request, res: Response) => {
  try {
    // ১. ডাটাবেস থেকে আসল কাউন্ট নেওয়া
    const [totalUsers, totalTrips, totalReviews, latestTrips] =
      await Promise.all([
        User.countDocuments(),
        Trip.countDocuments(),
        Review.countDocuments(),
        Trip.find().populate("user", "name").sort({ createdAt: -1 }).limit(5),
      ]);

    // ২. ফ্রন্টএন্ডের জন্য ডাইনামিক নোড ডাটা
    const systemNodes = [
      {
        name: "Explorer Directory",
        status: "Operational",
        uptime: "100%",
        latency: `${totalUsers} Users`,
        iconType: "Server",
        healthScore: 100,
      },
      {
        name: "Trip Database",
        status: "Active",
        uptime: "99.9%",
        latency: `${totalTrips} Plans`,
        iconType: "Database",
        healthScore: 100,
      },
      {
        name: "AI Review Engine",
        status: "Operational",
        uptime: "100%",
        latency: `${totalReviews} Reviews`,
        iconType: "Cpu",
        healthScore: 100,
      },
    ];

    // ৩. লাইভ ট্রিপ থেকে ইভেন্ট লগ তৈরি
    const recentLogs = latestTrips.map((trip) => ({
      timestamp: trip.createdAt,
      message: `${(trip.user as any)?.name || "User"} generated a trip to ${trip.destination}`,
      type: "success",
    }));

    // ৪. রেসপন্স পাঠানো
    res.status(200).json({
      success: true,
      systemNodes,
      recentLogs:
        recentLogs.length > 0
          ? recentLogs
          : [
              {
                timestamp: new Date(),
                message: "No recent activity",
                type: "info",
              },
            ],
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// get review public
export const getPublicReviews = async (req: Request, res: Response) => {
  try {
    const result = await Review.find()
      .populate("user", "name image")
      .populate("trip", "destination")
      .sort({ createdAt: -1 })
      .limit(6); 

    res.status(200).json({
      success: true,
      message: "Public reviews fetched successfully",
      data: result,
    });
  } catch (err: any) {
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch reviews" });
  }
};


export const aiControllers = {
  getAllUsers,
  deleteUser,
  generateTripPlan,
  getAllTrips,
  getPublicTrips,
  getSingleTripDetails,
  createReview,
  getAllReviews,
  getSystemStats,
  getAdminDashboardStats,
  updateUserRole,
  updateUserStatus,
  getAllContents,
  deleteContent,
  updateContentStatus,
  getPublicReviews
};

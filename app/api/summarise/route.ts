import { NextRequest, NextResponse } from "next/server"
import axios from "axios"
import * as cheerio from "cheerio"
import { MongoClient } from "mongodb"
import { createClient } from "@supabase/supabase-js"

// ✅ Load from environment variables
const MONGODB_URI = process.env.MONGODB_URI!
const SUPABASE_URL = process.env.SUPABASE_URL!
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

// 🧠 Static summary logic
function summarise(text: string): string {
  return text.split(".").slice(0, 2).join(".") + "."
}

// 🌐 Urdu translation using dictionary
const dictionary: Record<string, string> = {
  JavaScript: "جاوا اسکرپٹ",
  powerful: "طاقتور",
  versatile: "ہمہ جہت",
  programming: "پروگرامنگ",
  language: "زبان",
  web: "ویب",
  development: "ترقی",
}

function translateToUrdu(text: string): string {
  return text
    .split(" ")
    .map((word) => dictionary[word] || word)
    .join(" ")
}

// 🚀 Main API function
export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json()

    // 🔍 Scrape blog content
    const response = await axios.get(url)
    const $ = cheerio.load(response.data)

    $("script").remove()
    $("style").remove()

    let blogText =
      $(".text").text().trim() ||
      $(".entry-content").text().trim() ||
      $(".content").text().trim() ||
      $("article").text().trim()

    if (!blogText || blogText.length < 100) {
      blogText = $("p").text().trim()
    }

    blogText = blogText.replace(/\s+/g, " ")

    // 🧠 Summary and Urdu version
    const summary = summarise(blogText)
    const urdu = translateToUrdu(summary)

    // 🛢 Save to Supabase
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    await supabase.from("summaries").insert({ url, summary: urdu })

    // 🗃 Save full blog to MongoDB
    const client = await MongoClient.connect(MONGODB_URI)
    const db = client.db("blogSummariser")
    await db.collection("blogs").insertOne({ url, fullText: blogText })
    await client.close()

    // 📤 Return result
    return NextResponse.json({ summary, urdu })
  } catch (error: unknown) {
    console.error("API Error:", error)
    return NextResponse.json(
      { error: "Failed to summarise blog." },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from "next/server"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://web-runna-v2legajos.up.railway.app/api"

export async function GET(request: NextRequest) {
  try {
    // Get query parameters from the request
    const searchParams = request.nextUrl.searchParams
    const queryString = searchParams.toString()

    // Get authorization header
    const authHeader = request.headers.get("authorization")

    // Build the URL
    const url = `${API_BASE_URL}/legajos${queryString ? `?${queryString}` : ""}`

    console.log("Proxying request to:", url)

    // Forward the request to the actual API
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(authHeader ? { Authorization: authHeader } : {}),
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("API error:", response.status, errorText)
      return NextResponse.json(
        { error: "API request failed", details: errorText },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error: any) {
    console.error("Proxy error:", error)
    return NextResponse.json(
      { error: "Proxy request failed", message: error.message },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    // Get the body
    const body = await request.json()

    // Get authorization header
    const authHeader = request.headers.get("authorization")

    // Get the ID from the request (assuming it's passed in the body or URL)
    const id = body.id || request.nextUrl.searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 })
    }

    // Build the URL
    const url = `${API_BASE_URL}/legajos/${id}/`

    console.log("Proxying PATCH request to:", url)

    // Forward the request to the actual API
    const response = await fetch(url, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...(authHeader ? { Authorization: authHeader } : {}),
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("API error:", response.status, errorText)
      return NextResponse.json(
        { error: "API request failed", details: errorText },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error: any) {
    console.error("Proxy error:", error)
    return NextResponse.json(
      { error: "Proxy request failed", message: error.message },
      { status: 500 }
    )
  }
}

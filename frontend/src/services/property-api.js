// Function to get a property by ID
export const getPropertyById = async (id) => {
  try {
    console.log(`Fetching property with ID: ${id}`)

    // Add timestamp to prevent browser caching
    const timestamp = new Date().getTime()
    const response = await fetch(`/api/properties/${id}/?_t=${timestamp}`, {
      credentials: 'include', // Include cookies in the request
    })

    if (!response.ok) {
      throw new Error("Failed to fetch property")
    }

    const data = await response.json()
    console.log(`Fetched property ${id}:`, data)
    return data
  } catch (error) {
    console.error(`Error fetching property ${id}:`, error)
    throw error
  }
}

// Function to create a new property
export const createProperty = async (formData) => {
  try {
    // Get the authentication token from localStorage or your auth context    console.log("Creating property with data:", formData)

    const response = await fetch("/api/properties/", {
      method: "POST",
      credentials: 'include', // Include cookies in the request
      body: formData,
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => null)
      console.error("Server error response:", errorData)
      throw new Error("Failed to create property")
    }

    const result = await response.json()
    console.log("Property created successfully. Response:", result)

    // Store the newly created property in sessionStorage
    if (result && result.id) {
      sessionStorage.setItem("newlyCreatedProperty", JSON.stringify(result))
    }

    return result
  } catch (error) {
    console.error("Error creating property:", error)
    throw error
  }
}

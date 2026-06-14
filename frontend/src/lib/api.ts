const BASE_URL = "http://localhost:8000";

// sends request to login in
export async function login(email: string, password: string) {
    const formData = new URLSearchParams();
    formData.append("username", email);
    formData.append("password", password);

    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
          "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData,
    });

    if (!res.ok) {
    throw new Error("Login failed");
    }

    const data = await res.json();

    localStorage.setItem("token", data.access_token);

    return data;
}

// sends request to register a new account
export async function register(email: string, password: string) {
  const res = await fetch(`${BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) throw new Error("Register failed");

  const data = await res.json();
  localStorage.setItem("token", data.access_token);
  return data;
}

// reads token from browser and attaches it if existing
function getAuthHeaders() {
    const token = localStorage.getItem("token");

    return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
    }

// gets jobs with a certain status if given or just all jobs for profile
export async function getJobs(status?: string) {
    const url = status
        ? `${BASE_URL}/jobs?status=${status}`
        : `${BASE_URL}/jobs`;

    const res = await fetch(url, {
    method: "GET",
    headers: getAuthHeaders(),
    });

    if (!res.ok) {
    throw new Error("Failed to fetch jobs");
    }

    return await res.json();
}

// sends a request to scrape jobs based on profile
export async function scrape() {
  const res = await fetch(`${BASE_URL}/scrape`, {
    method: "POST",
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    throw new Error("Scraping failed");
  }

  return await res.json();
}

// sends a request to tailor resume and cover letter
export async function tailor() {
  const res = await fetch(`${BASE_URL}/tailor`, {
    method: "POST",
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    throw new Error("Tailoring failed");
  }

  return await res.json();
}

// sends a request to score job description for fit based on profile
export async function score() {
  const res = await fetch(`${BASE_URL}/score`, {
    method: "POST",
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    throw new Error("Scoring failed");
  }

  return await res.json();
}

// runs whole pipline: scraping, scoring, tailoring
export async function runPipeline() {
  const res = await fetch(`${BASE_URL}/run`, {
    method: "POST",
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    throw new Error("The pipeline failed");
  }

  return await res.json();
}

// update profile helper
async function updateProfile(endpoint: string, data: any) {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
        method: "PATCH",
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
    });

    if (!res.ok) {
        throw new Error("Failed to save profile");
    }

    return await res.json();
}

//update profile functions
export async function updateBasicProfile(data: any) {
  return updateProfile("/profile/basic", data);
}

export async function updateProfessionalProfile(data: any) {
  return updateProfile("/profile/professional", data);
}

export async function updateEducation(data: any) {
  return updateProfile("/profile/education", data);
}

export async function updateExperience(data: any) {
  return updateProfile("/profile/experience", data);
}

export async function updateProjects(data: any) {
  return updateProfile("/profile/projects", data);
}

export async function updatePreferences(data: any) {
  return updateProfile("/profile/preferences", data);
}

export async function completeProfile() {
  const res = await fetch(`${BASE_URL}/profile/complete`, {
    method: "POST",
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Failed to complete profile");
  return res.json();
}

// retrieves profile model based on current user
export async function getProfile() {
  const res = await fetch(`${BASE_URL}/profile`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Failed to retrieve profile");
  return res.json();
}

// retrieves profile metrics
export async function getMetrics() {
  const res = await fetch(`${BASE_URL}/profile/metrics`, {
    method: "GET", 
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Failed to retrieve metrics");
  return res.json();
}

// gets 10 most recent jobs
export async function getRecentJobs() {
  const res = await fetch(`${BASE_URL}/profile/jobs`, {
    method: "GET",
    headers: getAuthHeaders(),
  }); 
  if (!res.ok) throw new Error("Failed to retrieve recent jobs feed");
  return res.json();
}

// gets job discovery metrics for previous week of activity
export async function getFinderAnalytics() {
  const res = await fetch(`${BASE_URL}/profile/finder-analytics`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    throw new Error("Failed to retrieve finder analytics");
  }
  return res.json();
}
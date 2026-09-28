export const OPENAPI_SPEC = {
  "openapi": "3.0.3",
  "info": {
    "title": "India DITS — Backend REST API",
    "description": "Complete REST API documentation for the **India DITS** backend server — a multi-category real estate listing, lead management, and support platform.\n\n### 🔑 Authentication Flow\n1. Use `/auth/login` with your 10-digit mobile number.\n2. Copy the returned `accessToken`.\n3. Click the **Authorize** button (top right) and paste: `Bearer <your_token>`.\n\n### 🏢 Property Verticals\n* **Residential Rent**: Deposits, furnishing, lease terms, tenant preferences.\n* **Residential Resale**: Price, property age, loan status, parking.\n* **Residential PG / Hostel**: Room types, food inclusion, gate closing time.\n* **Commercial Rent**: Super built-up area, business usage, lock-in duration.\n* **Commercial Sale**: Carpet area, floor dimensions, investment potential.\n* **Land / Plot**: Plot length, plot width, boundary wall status, gated project.",
    "version": "1.0.0",
    "contact": {
      "name": "India DITS API Support",
      "email": "support@indiadits.com"
    }
  },
  "servers": [
    {
      "url": "http://localhost:5000/api",
      "description": "Local Development Server"
    }
  ],
  "tags": [
    {
      "name": "Authentication",
      "description": "User & agent registration, login, and session management"
    },
    {
      "name": "Feed & Search",
      "description": "Unified paginated feed across all property models (10 items / page)"
    },
    {
      "name": "Residential Rent",
      "description": "Residential rental listing CRUD and photo management"
    },
    {
      "name": "Residential Resale",
      "description": "Residential resale listing CRUD"
    },
    {
      "name": "PG / Hostel",
      "description": "PG / Hostel listing CRUD"
    },
    {
      "name": "Commercial Rent",
      "description": "Commercial rent listing CRUD"
    },
    {
      "name": "Commercial Sale",
      "description": "Commercial sale listing CRUD"
    },
    {
      "name": "Land / Plot",
      "description": "Land / plot resale listing CRUD"
    },
    {
      "name": "Leads & Inquiries",
      "description": "Buyer/tenant lead capture and CRM management"
    },
    {
      "name": "Support Desk",
      "description": "Contact / support ticket submission"
    }
  ],
  "security": [
    {
      "bearerAuth": []
    }
  ],
  "paths": {
    "/auth/register": {
      "post": {
        "tags": ["Authentication"],
        "summary": "Register new user / agent profile",
        "security": [],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/RegisterRequest"
              }
            }
          }
        },
        "responses": {
          "201": {
            "description": "User registered successfully",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/AuthResponse"
                }
              }
            }
          },
          "400": {
            "$ref": "#/components/responses/BadRequest"
          }
        }
      }
    },
    "/auth/login": {
      "post": {
        "tags": ["Authentication"],
        "summary": "Log in via mobile number",
        "security": [],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "required": ["mobile"],
                "properties": {
                  "mobile": {
                    "type": "string",
                    "example": "8870483093"
                  }
                }
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Login successful",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/AuthResponse"
                }
              }
            }
          },
          "400": {
            "$ref": "#/components/responses/BadRequest"
          },
          "404": {
            "$ref": "#/components/responses/NotFound"
          }
        }
      }
    },
    "/auth/refresh-token": {
      "post": {
        "tags": ["Authentication"],
        "summary": "Rotate refresh token & get new access token",
        "description": "Requires the HttpOnly refresh-token cookie set at login/registration.",
        "security": [
          {
            "cookieAuth": []
          }
        ],
        "responses": {
          "200": {
            "description": "New access token issued",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "success": { "type": "boolean", "example": true },
                    "accessToken": { "type": "string" }
                  }
                }
              }
            }
          },
          "401": {
            "$ref": "#/components/responses/Unauthorized"
          }
        }
      }
    },
    "/auth/logout": {
      "post": {
        "tags": ["Authentication"],
        "summary": "Clear refresh token & session",
        "responses": {
          "200": {
            "description": "Logged out successfully",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/SimpleSuccess"
                }
              }
            }
          },
          "401": {
            "$ref": "#/components/responses/Unauthorized"
          }
        }
      }
    },
    "/auth/me": {
      "get": {
        "tags": ["Authentication"],
        "summary": "Fetch active user session",
        "responses": {
          "200": {
            "description": "Active user session",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "success": { "type": "boolean", "example": true },
                    "user": { "$ref": "#/components/schemas/User" }
                  }
                }
              }
            }
          },
          "401": {
            "$ref": "#/components/responses/Unauthorized"
          }
        }
      }
    },
    "/feed": {
      "get": {
        "tags": ["Feed & Search"],
        "summary": "Unified paginated feed across all 6 property models",
        "security": [],
        "parameters": [
          { "name": "page", "in": "query", "schema": { "type": "integer", "default": 1 } },
          { "name": "limit", "in": "query", "schema": { "type": "integer", "default": 10 } },
          { "name": "category", "in": "query", "schema": { "type": "string", "enum": ["ALL", "RENT", "BUY", "LAND", "PG", "COMMERCIAL"], "default": "ALL" } },
          { "name": "city", "in": "query", "schema": { "type": "string" }, "example": "Chennai" },
          { "name": "search", "in": "query", "description": "Full-text query on locality, city, landmark, or title", "schema": { "type": "string" } },
          { "name": "minPrice", "in": "query", "schema": { "type": "number" } },
          { "name": "maxPrice", "in": "query", "schema": { "type": "number" } },
          { "name": "sortBy", "in": "query", "schema": { "type": "string", "enum": ["newest", "price-low", "price-high"], "default": "newest" } }
        ],
        "responses": {
          "200": {
            "description": "Paginated property feed",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/FeedResponse"
                }
              }
            }
          }
        }
      }
    },
    "/residential-rent": {
      "post": {
        "tags": ["Residential Rent"],
        "summary": "Create a residential rental listing",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/ResidentialRentCreate"
              }
            }
          }
        },
        "responses": {
          "201": {
            "description": "Property created successfully",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/PropertyCreateResponse"
                }
              }
            }
          },
          "400": { "$ref": "#/components/responses/BadRequest" },
          "401": { "$ref": "#/components/responses/Unauthorized" }
        }
      },
      "get": {
        "tags": ["Residential Rent"],
        "summary": "List all rental properties (paginated)",
        "security": [],
        "parameters": [
          { "name": "page", "in": "query", "schema": { "type": "integer", "default": 1 } },
          { "name": "limit", "in": "query", "schema": { "type": "integer", "default": 10 } }
        ],
        "responses": {
          "200": {
            "description": "List of rental properties",
            "content": {
              "application/json": {
                "schema": { "$ref": "#/components/schemas/FeedResponse" }
              }
            }
          }
        }
      }
    },
    "/residential-rent/{id}": {
      "get": {
        "tags": ["Residential Rent"],
        "summary": "Fetch single rental listing details",
        "security": [],
        "parameters": [{ "$ref": "#/components/parameters/PropertyId" }],
        "responses": {
          "200": {
            "description": "Rental listing details",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "success": { "type": "boolean", "example": true },
                    "data": { "$ref": "#/components/schemas/Property" }
                  }
                }
              }
            }
          },
          "404": { "$ref": "#/components/responses/NotFound" }
        }
      },
      "put": {
        "tags": ["Residential Rent"],
        "summary": "Update an existing rental listing",
        "description": "Owner authorization required.",
        "parameters": [{ "$ref": "#/components/parameters/PropertyId" }],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": { "$ref": "#/components/schemas/ResidentialRentCreate" }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Listing updated",
            "content": {
              "application/json": {
                "schema": { "$ref": "#/components/schemas/PropertyCreateResponse" }
              }
            }
          },
          "401": { "$ref": "#/components/responses/Unauthorized" },
          "403": { "$ref": "#/components/responses/Forbidden" },
          "404": { "$ref": "#/components/responses/NotFound" }
        }
      },
      "delete": {
        "tags": ["Residential Rent"],
        "summary": "Delete a rental listing (cascades to photos/leads)",
        "description": "Owner authorization required.",
        "parameters": [{ "$ref": "#/components/parameters/PropertyId" }],
        "responses": {
          "200": {
            "description": "Listing deleted",
            "content": {
              "application/json": {
                "schema": { "$ref": "#/components/schemas/SimpleSuccess" }
              }
            }
          },
          "401": { "$ref": "#/components/responses/Unauthorized" },
          "403": { "$ref": "#/components/responses/Forbidden" },
          "404": { "$ref": "#/components/responses/NotFound" }
        }
      }
    },
    "/residential-rent/{propertyId}/photos": {
      "post": {
        "tags": ["Residential Rent"],
        "summary": "Upload up to 9 photos",
        "description": "Owner authorization required. Accepts JPEG/PNG/WebP, max 5MB each, max 9 files.",
        "parameters": [
          { "name": "propertyId", "in": "path", "required": true, "schema": { "type": "string", "format": "uuid" } }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "multipart/form-data": {
              "schema": {
                "type": "object",
                "properties": {
                  "photos": {
                    "type": "array",
                    "items": { "type": "string", "format": "binary" }
                  }
                }
              }
            }
          }
        },
        "responses": {
          "201": {
            "description": "Photos uploaded successfully",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "success": { "type": "boolean", "example": true },
                    "message": { "type": "string", "example": "Photos uploaded successfully" },
                    "data": { "type": "array", "items": { "$ref": "#/components/schemas/Photo" } }
                  }
                }
              }
            }
          }
        }
      }
    },
    "/residential-resale": {
      "post": {
        "tags": ["Residential Resale"],
        "summary": "Create a residential resale listing",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": { "schema": { "$ref": "#/components/schemas/GenericPropertyCreate" } }
          }
        },
        "responses": {
          "201": {
            "description": "Property created successfully",
            "content": { "application/json": { "schema": { "$ref": "#/components/schemas/PropertyCreateResponse" } } }
          }
        }
      }
    },
    "/residential-pg": {
      "post": {
        "tags": ["PG / Hostel"],
        "summary": "Create a PG / Hostel listing",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": { "schema": { "$ref": "#/components/schemas/GenericPropertyCreate" } }
          }
        },
        "responses": {
          "201": {
            "description": "Property created successfully",
            "content": { "application/json": { "schema": { "$ref": "#/components/schemas/PropertyCreateResponse" } } }
          }
        }
      }
    },
    "/commercial-rent": {
      "post": {
        "tags": ["Commercial Rent"],
        "summary": "Create a commercial rent listing",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": { "schema": { "$ref": "#/components/schemas/GenericPropertyCreate" } }
          }
        },
        "responses": {
          "201": {
            "description": "Property created successfully",
            "content": { "application/json": { "schema": { "$ref": "#/components/schemas/PropertyCreateResponse" } } }
          }
        }
      }
    },
    "/commercial-sale": {
      "post": {
        "tags": ["Commercial Sale"],
        "summary": "Create a commercial sale listing",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": { "schema": { "$ref": "#/components/schemas/GenericPropertyCreate" } }
          }
        },
        "responses": {
          "201": {
            "description": "Property created successfully",
            "content": { "application/json": { "schema": { "$ref": "#/components/schemas/PropertyCreateResponse" } } }
          }
        }
      }
    },
    "/land-plot": {
      "post": {
        "tags": ["Land / Plot"],
        "summary": "Create a land/plot resale listing",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": { "schema": { "$ref": "#/components/schemas/GenericPropertyCreate" } }
          }
        },
        "responses": {
          "201": {
            "description": "Property created successfully",
            "content": { "application/json": { "schema": { "$ref": "#/components/schemas/PropertyCreateResponse" } } }
          }
        }
      }
    },
    "/leads": {
      "post": {
        "tags": ["Leads & Inquiries"],
        "summary": "Record / deduplicate a lead",
        "description": "Logs an interested buyer inquiry when viewing or contacting an owner. Deduplicates automatically if the same user viewed the property within the same 24-hour cycle.",
        "security": [],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": { "schema": { "$ref": "#/components/schemas/LeadCreate" } }
          }
        },
        "responses": {
          "201": {
            "description": "Lead created",
            "content": { "application/json": { "schema": { "$ref": "#/components/schemas/LeadResponse" } } }
          },
          "200": {
            "description": "Existing lead updated (deduplicated)",
            "content": { "application/json": { "schema": { "$ref": "#/components/schemas/LeadResponse" } } }
          }
        }
      }
    },
    "/leads/property/{propertyId}": {
      "get": {
        "tags": ["Leads & Inquiries"],
        "summary": "Get all leads for owner's listing",
        "description": "Owner authorization required.",
        "parameters": [
          { "name": "propertyId", "in": "path", "required": true, "schema": { "type": "string", "format": "uuid" } }
        ],
        "responses": {
          "200": {
            "description": "List of leads",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "success": { "type": "boolean", "example": true },
                    "data": { "type": "array", "items": { "$ref": "#/components/schemas/Lead" } }
                  }
                }
              }
            }
          }
        }
      }
    },
    "/leads/{id}/status": {
      "put": {
        "tags": ["Leads & Inquiries"],
        "summary": "Update lead status",
        "parameters": [
          { "name": "id", "in": "path", "required": true, "schema": { "type": "string", "format": "uuid" } }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "required": ["status"],
                "properties": {
                  "status": {
                    "type": "string",
                    "enum": ["Interested", "Contacted", "Visited", "Closed", "Rejected"],
                    "example": "Contacted"
                  }
                }
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Lead status updated",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "success": { "type": "boolean", "example": true },
                    "data": {
                      "type": "object",
                      "properties": {
                        "id": { "type": "string", "format": "uuid" },
                        "status": { "type": "string", "example": "Contacted" }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    "/support": {
      "post": {
        "tags": ["Support Desk"],
        "summary": "Submit a contact / support ticket",
        "security": [],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "required": ["name", "email", "message"],
                "properties": {
                  "name": { "type": "string", "example": "Gowtham" },
                  "email": { "type": "string", "format": "email", "example": "gowtham@example.com" },
                  "mobile": { "type": "string", "example": "8870483093" },
                  "subject": { "type": "string", "example": "Listing inquiry" },
                  "message": { "type": "string", "example": "I need help updating my listing." }
                }
              }
            }
          }
        },
        "responses": {
          "201": {
            "description": "Support ticket created",
            "content": {
              "application/json": {
                "schema": { "$ref": "#/components/schemas/SimpleSuccess" }
              }
            }
          }
        }
      }
    }
  },
  "components": {
    "securitySchemes": {
      "bearerAuth": {
        "type": "http",
        "scheme": "bearer",
        "bearerFormat": "JWT",
        "description": "Access token obtained from `/auth/login` or `/auth/register`"
      },
      "cookieAuth": {
        "type": "apiKey",
        "in": "cookie",
        "name": "refreshToken",
        "description": "HttpOnly refresh-token cookie set on login/registration"
      }
    },
    "parameters": {
      "PropertyId": {
        "name": "id",
        "in": "path",
        "required": true,
        "schema": { "type": "string", "format": "uuid" },
        "example": "81bcb889-e2a8-47e4-9ed4-e77d7b93351e"
      }
    },
    "responses": {
      "BadRequest": {
        "description": "Missing required fields / validation failure",
        "content": {
          "application/json": { "schema": { "$ref": "#/components/schemas/ErrorResponse" } }
        }
      },
      "Unauthorized": {
        "description": "Missing or invalid JWT access token",
        "content": {
          "application/json": { "schema": { "$ref": "#/components/schemas/ErrorResponse" } }
        }
      },
      "Forbidden": {
        "description": "User does not own the requested resource",
        "content": {
          "application/json": { "schema": { "$ref": "#/components/schemas/ErrorResponse" } }
        }
      },
      "NotFound": {
        "description": "Property or lead ID does not exist",
        "content": {
          "application/json": { "schema": { "$ref": "#/components/schemas/ErrorResponse" } }
        }
      }
    },
    "schemas": {
      "ErrorResponse": {
        "type": "object",
        "properties": {
          "success": { "type": "boolean", "example": false },
          "error": { "type": "string", "example": "Detailed error message" },
          "statusCode": { "type": "integer", "example": 400 }
        }
      },
      "SimpleSuccess": {
        "type": "object",
        "properties": {
          "success": { "type": "boolean", "example": true },
          "message": { "type": "string", "example": "Operation completed successfully" }
        }
      },
      "RegisterRequest": {
        "type": "object",
        "required": ["mobile", "countryCode", "name"],
        "properties": {
          "mobile": { "type": "string", "example": "8870483093" },
          "countryCode": { "type": "string", "example": "+91" },
          "name": { "type": "string", "example": "Gowtham" },
          "email": { "type": "string", "format": "email", "example": "gowtham@example.com" },
          "isRealEstateAgent": { "type": "boolean", "example": false },
          "password": { "type": "string", "example": "optionalPassword123" }
        }
      },
      "User": {
        "type": "object",
        "properties": {
          "id": { "type": "integer", "example": 2 },
          "mobile": { "type": "string", "example": "8870483093" },
          "countryCode": { "type": "string", "example": "+91" },
          "name": { "type": "string", "example": "Gowtham" },
          "email": { "type": "string", "example": "gowtham@example.com" },
          "isRealEstateAgent": { "type": "boolean", "example": false },
          "createdAt": { "type": "string", "format": "date-time" }
        }
      },
      "AuthResponse": {
        "type": "object",
        "properties": {
          "success": { "type": "boolean", "example": true },
          "message": { "type": "string", "example": "User registered successfully" },
          "accessToken": { "type": "string" },
          "refreshToken": { "type": "string" },
          "user": { "$ref": "#/components/schemas/User" }
        }
      },
      "Photo": {
        "type": "object",
        "properties": {
          "id": { "type": "string", "format": "uuid" },
          "propertyId": { "type": "string", "format": "uuid" },
          "originalName": { "type": "string", "example": "living_room.jpg" },
          "mimeType": { "type": "string", "example": "image/jpeg" },
          "size": { "type": "integer", "example": 153040 },
          "url": { "type": "string", "example": "img/rent/f5edc328-0871-4dd7-99da-6204b024d348.jpg" },
          "displayOrder": { "type": "integer", "example": 0 }
        }
      },
      "Property": {
        "type": "object",
        "properties": {
          "id": { "type": "string", "format": "uuid" },
          "userId": { "type": "integer", "example": 2 },
          "propertyCategory": { "type": "string", "example": "Residential" },
          "adType": { "type": "string", "example": "Rent" },
          "propertyType": { "type": "string", "example": "Apartment" },
          "bhkType": { "type": "string", "example": "1 BHK" },
          "city": { "type": "string", "example": "Chennai" },
          "locality": { "type": "string", "example": "Anna Nagar" },
          "expectedRent": { "type": "string", "example": "10000" },
          "expectedDeposit": { "type": "string", "example": "100000" },
          "furnishing": { "type": "string", "example": "Fully Furnished" },
          "builtUpArea": { "type": "string", "example": "100" },
          "isActive": { "type": "boolean", "example": true },
          "createdAt": { "type": "string", "format": "date-time" },
          "photos": { "type": "array", "items": { "$ref": "#/components/schemas/Photo" } },
          "user": {
            "type": "object",
            "properties": {
              "id": { "type": "integer", "example": 2 },
              "name": { "type": "string", "example": "Gowtham" },
              "mobile": { "type": "string", "example": "8870483093" }
            }
          }
        }
      },
      "FeedResponse": {
        "type": "object",
        "properties": {
          "success": { "type": "boolean", "example": true },
          "data": { "type": "array", "items": { "$ref": "#/components/schemas/Property" } },
          "pagination": {
            "type": "object",
            "properties": {
              "totalCount": { "type": "integer", "example": 11 },
              "page": { "type": "integer", "example": 1 },
              "limit": { "type": "integer", "example": 10 },
              "totalPages": { "type": "integer", "example": 2 },
              "hasNextPage": { "type": "boolean", "example": true },
              "hasPrevPage": { "type": "boolean", "example": false }
            }
          }
        }
      },
      "ResidentialRentCreate": {
        "type": "object",
        "required": ["propertyType", "city", "locality", "expectedRent"],
        "properties": {
          "propertyType": { "type": "string", "example": "Apartment" },
          "bhkType": { "type": "string", "example": "2 BHK" },
          "totalFloor": { "type": "string", "example": "4" },
          "propertyAge": { "type": "string", "example": "1-3 years" },
          "facing": { "type": "string", "example": "East" },
          "builtUpArea": { "type": "string", "example": "1150" },
          "city": { "type": "string", "example": "Chennai" },
          "locality": { "type": "string", "example": "Velachery" },
          "landmark": { "type": "string", "example": "Near Phoenix Mall" },
          "expectedRent": { "type": "string", "example": "22000" },
          "expectedDeposit": { "type": "string", "example": "120000" },
          "rentNegotiable": { "type": "boolean", "example": true },
          "depositNegotiable": { "type": "boolean", "example": false },
          "monthlyMaintenance": { "type": "string", "example": "2000" },
          "furnishing": { "type": "string", "example": "Semi-Furnished" },
          "parking": { "type": "string", "example": "Covered" },
          "bathrooms": { "type": "integer", "example": 2 },
          "balcony": { "type": "integer", "example": 1 },
          "waterSupply": { "type": "string", "example": "Corporation & Borewell" },
          "gym": { "type": "string", "example": "Yes" },
          "petAllowed": { "type": "string", "example": "Yes" },
          "gatedSecurity": { "type": "string", "example": "Yes" },
          "description": { "type": "string", "example": "Spacious 2 BHK with modular kitchen and private balcony." },
          "whoWillShow": { "type": "string", "example": "Owner" },
          "availableFrom": { "type": "string", "format": "date", "example": "2026-09-01" }
        }
      },
      "GenericPropertyCreate": {
        "type": "object",
        "description": "Shared shape for resale, PG, commercial, and land/plot listing creation.",
        "properties": {
          "propertyType": { "type": "string", "example": "Apartment" },
          "city": { "type": "string", "example": "Chennai" },
          "locality": { "type": "string", "example": "Velachery" },
          "landmark": { "type": "string", "example": "Near Phoenix Mall" },
          "price": { "type": "string", "example": "8500000" },
          "priceNegotiable": { "type": "boolean", "example": true },
          "builtUpArea": { "type": "string", "example": "1150" },
          "description": { "type": "string", "example": "Well-maintained property, ready to move." }
        },
        "additionalProperties": true
      },
      "PropertyCreateResponse": {
        "type": "object",
        "properties": {
          "success": { "type": "boolean", "example": true },
          "message": { "type": "string", "example": "Property created successfully" },
          "data": {
            "type": "object",
            "properties": {
              "id": { "type": "string", "format": "uuid" },
              "userId": { "type": "integer", "example": 2 },
              "propertyType": { "type": "string", "example": "Apartment" },
              "bhkType": { "type": "string", "example": "2 BHK" },
              "city": { "type": "string", "example": "Chennai" },
              "locality": { "type": "string", "example": "Velachery" },
              "createdAt": { "type": "string", "format": "date-time" }
            }
          }
        }
      },
      "LeadCreate": {
        "type": "object",
        "required": ["propertyId", "propertyType"],
        "properties": {
          "userId": { "type": "integer", "example": 2 },
          "propertyId": { "type": "string", "format": "uuid", "example": "81bcb889-e2a8-47e4-9ed4-e77d7b93351e" },
          "propertyType": { "type": "string", "example": "Apartment" },
          "status": { "type": "string", "example": "Interested" },
          "viewedTime": { "type": "string", "example": "24 Aug 2026, 12:30 PM" }
        }
      },
      "Lead": {
        "type": "object",
        "properties": {
          "no": { "type": "integer", "example": 1 },
          "id": { "type": "string", "format": "uuid" },
          "userId": { "type": "integer", "example": 2 },
          "name": { "type": "string", "example": "Gowtham" },
          "mobile": { "type": "string", "example": "+91 8870483093" },
          "email": { "type": "string", "example": "gowtham@example.com" },
          "viewedTime": { "type": "string", "example": "24 Aug 2026, 12:30 PM" },
          "status": { "type": "string", "example": "Interested" }
        }
      },
      "LeadResponse": {
        "type": "object",
        "properties": {
          "success": { "type": "boolean", "example": true },
          "data": { "$ref": "#/components/schemas/Lead" }
        }
      }
    }
  }
};

<?php

/**
 * Gemini API Configuration
 * 
 * To use Gemini AI for question generation:
 * 1. Get your API key from: https://makersuite.google.com/app/apikey
 * 2. Set it here or use environment variable GEMINI_API_KEY
 * 3. For production, use environment variables instead of hardcoding
 */

return [
    'api_key' => getenv('GEMINI_API_KEY') ?: '', // Set via environment variable for security
];



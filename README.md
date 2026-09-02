# Thawing Memory

Thawing Memory is a generative AI prototype for first-generation Malayalis in South Africa who carry partial, sensory, or family-specific cooking memories

## This is a research proof-of-concept, not a cultural authority or verified recipe source

Rather than asking AI to declare or give an authentic recipe, the Kitchen in this project treats the model as a limited interviewer and organiser
The user supplies every piece of recipe evidence, evaluates the model's interpretation, and retains authority over the recipe

## Core interaction

1. Share a remembered cooking fragment
2. Receive a reflection, limitation, and focused question from a live model 
NOTE: the AI sometimes responds weirdly, like gives you words, but still isn't answering the question
3. Answer or skip up to three follow-up questions.
4. Build a Working Family Recipe from user-authored fragments only
5. Keep, edit, or reject the reconstruction
6. Save the complete trace to the browser-local Living Archive

Missing quantities, ingredients, timings, and steps remain visible under **Still unknown**. The model is instructed not to silently complete them, so that it does not alter the recipe

## Design argument

The prototype investigates whether interface design can make generative AI's limits visible while returning interpretive authority to the user. Its central principle is:

-The safeguard is not the AI itself, but the interaction design around the AI.

AI and user writing remain separately labelled. Earlier AI questions are retained as context but excluded from recipe evidence

## Current scope

- The Kitchen is the only functional reconstruction domain for this prototype
- Garden and Ritual sections help communicate the concept but are intentionally marked Coming Soon for the upcoming prototype
- Saved traces remain in `localStorage` on the current device
- No accounts, cloud database, community archive, analytics, or participant study are included




## Technology

- React Vite and React Router
- Gemini primary API with automatic Groq fallback API

## Local setup

``` Terminal: npm install
Please run the server and client in separate terminals:
```Terminal:
npm run server
```
```Terminal:
npm run dev
```


## API fallback

Gemini is the primary API. Groq only comes in after the Gemini rate limit, timeout, network failure, or temporary provider error
Invalid structured output is communicated to the user


# Critical Reflection Draft: Thawing Memory

## From proposal to prototype

Thawing Memory began as a broader proposal containing Kitchen, Garden, and Ritual spaces. Building the prototype made the central risk clearer: visual breadth could conceal an interaction that did not actually demonstrate the argument. I therefore reduced the assessed scope to one functional Kitchen loop. Garden and Ritual remain visible as future spaces, but they are explicitly marked Coming Soon. This reduction allowed the prototype to prioritise a real generative model call, visible authorship, user correction, failure recovery, and preservation of the resulting trace.

The project asks how a generative AI application might support cultural reconnection for first-generation Malayalis in South Africa while exposing the model's limits. The prototype does not treat AI as a cultural archive or recipe authority. It tests whether interaction design can turn an uncertain model response into material the user actively evaluates.

## What changed through making

The first working version accepted one memory fragment and returned a reflection, limitation, and sensory question. Technically, this met the live-generation requirement. Conceptually, it was weak. The model often paraphrased the user and then asked a question that could not be answered inside the interface. The interaction identified uncertainty without helping the user do anything with it.

This failure changed the project. The single response became a bounded conversation of up to three follow-up answers. Questions were revised to prioritise operational gaps such as quantity, sequence, heat, texture, readiness, substitution, and family terminology. The user may answer, skip, or stop early. Their fragments are then organised into a Working Family Recipe. Missing information remains visible under Still unknown.

This is not simply a feature expansion. It sharpens the argument. The model may organise user-supplied evidence, but it may not complete missing cultural knowledge. AI questions are stored as context and explicitly excluded from recipe evidence. The user can keep the reconstruction provisionally, rewrite it, or reject it. The archive preserves the distinction between the original fragments, provisional AI responses, and the user's final decision.

## Model failure as design evidence

A live chammanthi conversation exposed the limits of prompt constraints. After the user explained that an ammiikkal was the stone used to prepare chammanthi, the model asked, “How many ammiikkal did she add?” The question confused a tool with an ingredient. A later response recovered partially, but the mistake demonstrates that a model can misunderstand family terminology even when its output is fluent.

I kept this exchange in the demonstration archive rather than correcting the record invisibly. This supports the project's claim that uncertainty labels alone are not safeguards. The interface must preserve model authorship, make rejection possible, and avoid converting AI wording into user evidence. The mistake also shows why the prototype should not provide supposedly authoritative regional recipes.

## Interface and visual decisions

The interface separates user-authored and AI-generated material through headings, labels, structure, and decorative systems rather than colour alone. The Kitchen now presents three visible stages: Share a memory, Reconstruct together, and Review and save. The memory card sits beside the accumulated reconstruction, while the current AI response sits beside the next-step controls on wider screens. This pairing reduces the long vertical sequence that emerged when conversational turns were added.

Kerala-informed illustrations and botanical ornaments establish a specific visual identity. They are decorative, hidden from assistive technology, and positioned outside protected text columns. The custom SVGs are currently too large for a production site, so optimisation remains documented as future work rather than being concealed.

Motion was also reduced through iteration. A travelling flower initially attempted to show a memory moving toward the next response, but it competed with pulsing borders, focus flowers, loading text, and the content itself. Removing it improved hierarchy and removed an artificial delay. Reduced-motion preferences disable the remaining non-essential animation.

## Technical decisions and reliability

The browser calls a local Node endpoint so provider keys never enter client code. Gemini is the primary provider. Repeated free-quota failures interrupted development and made the assessed live interaction unreliable, so Groq was added as a server-side fallback for rate limits, timeouts, network errors, and temporary provider failures. Both providers must satisfy the same locally validated response contracts. Invalid structured output is surfaced instead of being hidden by switching providers.

The fallback improves resilience but does not remove dependency on external services. Both free providers have changing quotas and availability. The interface therefore preserves user fragments through failed requests and communicates errors without implying that the memory was lost.

Archive persistence was revised from a single-turn version 1 record to a version 2 conversation record. Version 2 stores all memory fragments, AI responses, skipped questions, the Working Family Recipe, and the user's evaluation. The reader still loads version 1 entries so earlier browser data is not silently erased.

## Evaluation and limitations

No participant testing was conducted, in keeping with the prototype brief. Evaluation consisted of iterative self-testing with fictional or demonstration memories, inspection of live model outputs, automated contract tests, linting, and production builds. The tests cover conversation limits, source separation, skipped questions, recipe invalidation, request validation, provider fallback, and archive-version compatibility.

The prototype still has important limitations. Local storage is not suitable for sensitive or durable personal archives. The interface is primarily English-medium. A bounded conversation cannot reconstruct knowledge the user does not hold. The model may still produce irrelevant or culturally flattened questions. The visual assets require optimisation, and the application has not been evaluated with its intended audience.

## What the prototype demonstrates

The resulting prototype exceeds a mock-up because a real model materially changes the interaction. More importantly, it demonstrates that the model's output is not the final cultural object. The meaningful result is the trace of negotiation: what the user remembered, what the model inferred, where it failed, what remained unknown, and what the user chose to preserve.

The build therefore changed my understanding of the original proposal. Responsible cultural AI is not achieved by asking a model to announce that it may be wrong. It requires constraints in the data structure, visible authorship, recoverable disagreement, and an interaction whose endpoint returns authority to the user.

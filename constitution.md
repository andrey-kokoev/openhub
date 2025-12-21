# OpenHub Constitution

## Preamble

We, the developers who depend on open infrastructure, in order to preserve the capability of remote development, ensure framework independence, provide for community ownership, promote interoperability, and secure the benefits of hot reload against real data to ourselves and future developers, do establish this Constitution for OpenHub.

## Article I: Dharma

### Section 1: Supremacy
Dharma is the supreme type system of OpenHub. All Providers, Runtimes, and Metaframeworks must conform to Dharma. Any implementation inconsistent with Dharma is invalid.

### Section 2: Scope
Dharma defines:
- The shape of each layer (Provider, Runtime, Metaframework)
- The boundaries between layers (P→R, R→P, R→M, M→R)
- The universal binding types (Database, KV, Blob)

### Section 3: Limits
Dharma shall make no definition beyond what is necessary for interoperability. Platform-specific bindings are outside Dharma's scope.

## Article II: Providers

### Section 1: Purpose
A Provider adapts a cloud platform's primitives to Dharma's universal bindings.

### Section 2: Powers
A Provider may:
- Implement proxy clients for remote mode
- Implement proxy handlers for deployed mode
- Extract real bindings from platform context

### Section 3: Limits
A Provider shall not:
- Depend on any specific Runtime
- Depend on any specific Metaframework
- Define bindings outside Dharma's universal set

## Article III: Runtimes

### Section 1: Purpose
A Runtime executes application code and manages bindings within request context.

### Section 2: Powers
A Runtime may:
- Register Providers
- Expose proxy endpoints
- Inject bindings into request context
- Construct transport from configuration

### Section 3: Limits
A Runtime shall not:
- Depend on any specific Metaframework
- Depend on any specific Provider
- Modify Dharma's type contracts

## Article IV: Metaframeworks

### Section 1: Purpose
A Metaframework provides developer experience: configuration, CLI, devtools.

### Section 2: Powers
A Metaframework may:
- Configure Runtimes
- Register Providers with Runtimes
- Extend CLI with flags and commands
- Provide devtools integration

### Section 3: Limits
A Metaframework shall not:
- Bypass Runtime to access Provider directly
- Modify Dharma's type contracts
- Require a specific Provider

## Article V: Amendment

### Section 1: Proposal
Amendments to Dharma may be proposed by any contributor via pull request.

### Section 2: Ratification
An amendment is ratified when:
- It maintains backward compatibility, OR
- It increments Dharma's major version
- It receives approval from maintainers of at least two implementations across different layers

### Section 3: Breaking Changes
No amendment shall break existing conforming implementations without major version increment and six-month deprecation notice.

## Article VI: Interoperability

### Section 1: Substitutability
Any Provider conforming to Dharma shall work with any Runtime conforming to Dharma. Any Runtime conforming to Dharma shall work with any Metaframework conforming to Dharma.

### Section 2: Certification
An implementation may claim OpenHub conformance only if it passes Dharma's type tests.

## Article VII: Ratification

This Constitution takes effect upon:
- Publication of @openhub2/dharma to npm
- At least one conforming Provider
- At least one conforming Runtime
- At least one conforming Metaframework

## Bill of Rights

### I
OpenHub shall make no implementation that locks users to a single cloud provider.

### II
The right of developers to fork, modify, and redistribute shall not be infringed.

### III
No proprietary dependency shall be required for core functionality.

### IV
The community shall be secure in their data; no telemetry or tracking shall exist without explicit opt-in.

### V
No implementation shall be merged that breaks conforming downstream implementations without due process (Article V).

### VI
In all disputes over conformance, Dharma's type tests shall be the final arbiter.

### VII
Powers not enumerated to Providers, Runtimes, or Metaframeworks are reserved to application developers.

### VIII
Corporate acquisition of any implementation shall not affect the rights granted herein.

### IX
The enumeration of certain rights shall not be construed to deny others retained by the community.

### X
All rights, powers, and privileges not delegated to OpenHub are reserved to individual developers and their applications.
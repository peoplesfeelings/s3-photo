# agents.md

for consumption by the generative coding agent tools that the human user is using to build this project.

## guidelines for coding agents:
- never generate extra crap. only implement features you're instructed to, by the human user.
- don't guess if you don't know.
- you are encouraged to ask questions, to clarify ambiguity in your instructions. 
- you are encouraged to break tasks down, when necessary. 
- raise significant software design and implementation decisions for discussion, so the human user may make the decisions. 
- follow best practices.
- avoid code redundancy.
- avoid data redundancy.
- seek elegant solutions.
- code organization should be pristine, but not over-engineered.
- simplicity is prefered over complexity. 
- keep your messages as short as possible.
- you are allowed to persist information for subsequent agent runs. persist such info by creating files and folders in the `/docs/` folder, which is meant for consumption by agents, as context. 
- check with the human user before making changes in the `/docs/` folder. 
- cleanup unused or outdated info in the `/docs/` folder. 
- readme.md is for the human user (someone who may install it in their aws account). the readme should have top-level information about using this project. 
- avoid editing the readme. 
- it is appropriate to edit the readme if instructed to by the human user, or if making changes relevant to the appropriate categories of information for the readme.
- appropriate categories of information for the readme include procedures for local development, environment setup, application configuration, testing, initial installation in an aws account, and deployment.
- if you must edit the readme, keep text extremely concise.
- do not edit agents.md. if there is some conflict in or with agents.md, inform the human user.
- when you finish a task, and inform the human user of this, remind the human user that you can check for outdated crap and clean it up. wait for the human user to agree, then check the codebase for technical debt and clean it up. 

## more agentic instruction:
see `/docs/*` for more agentic instruction.
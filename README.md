Objectives:
Turn your wireframe from A02 into a clean, well-structured personal class portfolio homepage using
HTML and CSS.
Demonstrate correct use of semantic HTML and readable, organized CSS.
Apply layout, and navigation principles from class intentionally (not randomly).

Instructions
. Create your personal class portfolio homepage using HTML and CSS only as per your wireframe in A02.
. Complete the same Core Requirements (HTML + CSS).
. Complete the required subset of Optional Requirements.
Clearly state your choices in your README .
. Use ONE external CSS file named style.css , linked in your HTML using: <link rel="stylesheet"
href="style.css">
AI use is not allowed for any part of this assignment (no content, no code, no styling ideas).

Submission
On the virtual machine:
. Your portfolio webpage must be deployed to:
/srv/csc391web/<YourUserName>/
. Your deployment directory must include:
index.html
style.css
any additional folders/files needed (images, additional pages, etc.)
. Add a README file in the same directory explaining:
what optional requirement sets you chose
any classmates, resources, or examples you consulted
It is your responsibility to verify that the webpage renders correctly when accessed via:
http://10.26.1.114/<YourUserName>/
from a device connected to the BaronNet network.
. A link to your github repository in your webpage footer.
. No files should be edited after the submission deadline.

On Canvas
Submit:
. A PDF of your portfolio homepage
WebDev A03-Portfolio.md
2 / 4
Core Requirements (Everyone)

HTML
Semantic HTML5 structure using:
<header> , <nav> , <main> , <section> , <footer>
At least three distinct sections inside <main> :
About (or a link to About page)
Individual Projects
Team Projects
A navigation menu that includes links to:
Home (this page)
Individual Projects (jump link or separate page)
Team Projects (jump link or separate page)
About (jump link or separate page)
A clear main heading (example: your name + a title such as “Web Development Portfolio”)
An “About Me” section (at least one short paragraph)
At least one image with meaningful alt text (icon/logo/placeholder is fine)
A footer that includes at least:
your name
the year
a GitHub link to your repository for this assignment

CSS
Use exactly one external stylesheet named style.css .
consistent indentation
logically grouped rules
meaningful class/ID names
no inline style=""
Consistent color scheme (background, text, links, section colors; readable contrast)
Style page background and text color intentionally.
Style links so they are clearly distinguishable (default + hover + visited).
Typography ( font-family , sizes, weights, line-height)
Set a font-family for the page.
Use readable font sizes and spacing ( line-height , margins).
Make headings visually distinct from body text.
Use margin , padding , and border intentionally
Explicitly set margin and padding for at least one major section or container.
Use a border in at least one place (card, section, nav, image, etc.).
Layout should not feel cramped or randomly spaced.
Your <nav> must include:
visible styling (background color or clear design treatment)
spacing between links
a visible hover effect for links
Include at least two wayfinding cues
WebDev A03-Portfolio.md
3 / 4

Additional Requirements (Pick a Subset)
Complete THREE (3) items from the list below. Do not add features randomly. Pick items that actually improve
layout, readability, navigation, or presentation.
. Layout System
Use Flexbox or CSS Grid to organize part of your page.
Example uses:
two-column layout (main content + aside)
grid of project cards
responsive rearrangement on smaller screens

The layout system should clearly improve structure, not just exist.
. Sticky or Fixed Element
Implement ONE:
sticky header ( position: sticky; top: 0; )
fixed footer ( position: fixed; bottom: 0; )
It must work correctly and not obscure content.
. Enhanced Text Styling
Improve text readability and hierarchy using:
adjusted line-height
section spacing
tasteful letter spacing or text transformation
Headings should feel intentionally designed, not default browser text.
. Text Emphasis Element
Include and style ONE of the following:
<blockquote>
<figure> with <figcaption>
Styling should clearly distinguish it from surrounding content.
. Media Presentation
Include and style a media section with:
images laid out intentionally (spacing, borders, alignment)
responsive behavior (no over flow on small screens)
Media must add value to the page, not act as decoration only.
. Hover & Interaction Effects
Add hover effects to links, cards, images, or navigation items.
Effects should be subtle and purposeful (color change, underline, shadow, etc.).
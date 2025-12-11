# **App Name**: FolioFlow

## Core Features:

- Folio Creation Form: A form to input data for the folio, including section, addressee ('Dirigido a'), subject ('Asunto'), responsible person, and creation date. Uses the layout and input field design based on the image provided.
- Automated Folio Numbering: Automatically generate a unique, serialized folio number based on the selected section (e.g., DGIP-DAP-[Section]-[Serial Number]).
- Folio Storage: Store folio data in a database to maintain a registry of created folios. Stores associated information such as addressee, subject, responsible person, and creation date.
- Folio Overview Table: Display folios in a table format with the option to sort the data based on the user’s criteria (like section, addressee, responsible person and creation date)
- Folio Content Generation (AI): Generate the standard folio text automatically from a short user summary using AI; uses reasoning as a tool to incorporate or omit clauses from the user summary based on relevance to the default folio structure.

## Style Guidelines:

- Primary color: Deep blue (#143C7C) to reflect professionalism and trust.
- Background color: Very light gray (#F5F5F5) to provide a clean and neutral canvas.
- Accent color: A magenta red (#D30640) as a secondary color to draw attention to the create folio button
- Font pairing: 'Public Sans' - SemiBold for headlines and 'Public Sans' for body text; 'Public Sans' is a sans-serif.
- Simple, professional icons for actions and navigation.
- Form layout: Mimic the general layout from the image in the user's prompt, with clear, well-spaced fields.
- Subtle transition animations when generating folio numbers or storing folios.
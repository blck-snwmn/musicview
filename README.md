# Music Visualizer

A web application that visualizes music files in the browser.
Real-time visualization of frequency spectrum from uploaded music files.

## Features

- Music file upload and playback
- Real-time frequency spectrum visualization
- Available visualization modes:
  - Linear Display: Shows frequency spectrum as a continuous line
  - Circular Display: Arranges frequency data in a circular pattern
  - Frequency Bars: Displays frequency data as vertical bars
  - Symmetric Display: Shows frequency data as symmetric bars around the center line
  - Layered Display: Visualizes low, mid, and high frequency ranges with overlapping colored areas
- Playback controls (Play/Stop)
- Volume control
- Mode switching (dropdown menu)

## Tech Stack

- Framework: Next.js 15.2.3 (App Router)
- UI: React 19
- Styling: Tailwind CSS
- Audio Processing: Web Audio API

## Development Setup

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev
```

After starting the development server, you can access the application at [http://localhost:3000](http://localhost:3000).

## Usage

1. Access the application
2. Click the "Choose File" button to upload a music file
3. Click the "Play" button to start playback
4. Select your preferred visualization mode from the dropdown menu
5. Adjust the volume using the slider as needed

## Notes

- This project is primarily intended for experimental feature verification
- Music files are processed client-side only and are not uploaded to any server
- Requires a browser that supports the Web Audio API

## License

This project is released under the MIT License.

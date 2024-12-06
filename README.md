# **JobQuest Visualization**

## **Overview**

JobQuest Visualization is an interactive data visualization project that explores job opportunities, salary trends, and demand for roles across the United States. This project provides insights into job market demographics, trends, and projections using intuitive visualizations powered by D3.js.

The website features multiple sections, including a choropleth map, bar charts, and bubble charts, to allow users to explore and analyze job-related data interactively.

---

## **Project Website and Screencast**

- **Website URL:** [JobQuest Visualization](https://dataviscourse2024.github.io/group-project-jobquest-visualization/)
- **Screencast Video:** [YouTube Link](https://www.youtube.com/watch?v=NB7pXTM_B9Q)

---

## **Project Contents**

This project includes the following components:

### **Code**
1. **HTML**:
   - Contains the structure of the website and defines sections like navigation, visualizations, and footer.
   - Main file: `index.html`

2. **CSS**:
   - Handles the styling of the website, including the navbar, charts, tooltips, and layout.
   - Main file: `style.css`

3. **JavaScript**:
   - Implements interactive visualizations using D3.js and TopoJSON.
   - Main file: `main.js`

4. **Data Files**:
   - The `data` directory contains datasets used for creating the visualizations.

### **Libraries**
The following external libraries were used:
- **[D3.js](https://d3js.org/):** For creating interactive visualizations.
- **[TopoJSON](https://github.com/topojson/topojson):** For handling geographical data used in the choropleth map.

---

## **Features**

### **Website Sections**
1. **Home**:
   - Introduction to the project and its purpose.
2. **Demographics**:
   - Choropleth map showing job densities across the United States.
   - Tooltips with detailed state-level information.
3. **Job Trends**:
   - Multi-line charts displaying monthly job opening rates over the years.
4. **Job Type Projections**:
   - Bubble charts showing projected growth rates for tech jobs.
5. **Statewise Top Jobs**:
   - Bar charts depicting the most popular job roles for selected states.
6. **Video Section**:
   - A menu link opens a screencast video demonstrating the project's features.

---

## **Non-Obvious Features**
1. **Dynamic Tooltips**:
   -  Hover over elements to reveal detailed information like job counts, salaries, and trends.

2. **Dropdown Menu**:
   -  In the bar chart section, users can select different states from a dropdown menu to view specific job roles.
   -  In the single-line chart section, users can select a year from a dropdown menu to view job opening rates for that specific year.

3. **Highlighting & Transitions:**
    - In the bubble chart, hovering highlights bubbles and displays detailed job data.
    - In the multi-line chart, hovering highlights a line with a tooltip, and clicking isolates a specific year's trend.
---

## **Usage Instructions**
1. Navigate to the website using the provided URL.
2. Use the navigation bar to explore different sections of the visualization:
   - **Demographics:** Hover over the map to see job data by state.
   - **Job Trends:** Explore trends using interactive line plots.
   - **Statewise Top Jobs:** Select states to view bar charts of top roles.
   - **Video:** Watch a screencast video for a guided walkthrough.


# 🧠 Smart Budget Planner
**Data Science:** Jeel Faldu and Raphael Lu

**Software Engineering:** Alfonso, Gisell and Vinod Jacob

## 📘 Overview
**Smart Budget Planner** is a web-based app that helps users **track spending, compare, it to benchmarks**, and make smarter financial decisions — especially during the holiday shopping season.
This project was built collaboratively by **Data Science** and **Software Engineering** teams to simulate a real-world product pipeline where **data fuels intelligent applications**.

## 🧩 Project Structure
```
Smart-Budget-Planner/
│
├── Data-Science/
│ ├── cleaned_data/
│ ├── all_countries_user_data.json
│ ├── north_america_user_data.json
│ └── one_country_preview.json
│ │
│ ├── dataset/ ← Source Kaggle data
│ ├── notebook.ipynb ← Main data science notebook
│
├── blocks/ ← Layout components (headers, sections)
├── components/ ← React components (forms, dashboard, charts)
├── images/ ← App icons and visuals
├── pages/ ← App pages (Home, Reports, etc.)
├── utils/ ← Validation, constants, and helpers
├── vendor/ ← External styles or dependencies
│
├── index.html ← Main HTML entry point
├── LICENSE
├── .gitignore
├── .gitattributes ← Git LFS setup for large files
├── README.md ← (You are here)
└── package.json
```

## ⚙️ Project Goals

| Domain                   | Goals                                                                                                            |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------- |
| **Data Science**         | Clean & process raw transaction data; generate user vs. benchmark comparisons; export JSONs for app integration. |
| **Software Engineering** | Build a responsive budgeting app using DS data; enable expense entry, visualization, and smart insights.         |

## 🧠 Data Science Process

1️⃣ Data Cleaning & Preparation

- Loaded Kaggle dataset (ismetsemedov/transactions)
- Removed fraud cases and redundant columns
- Standardized date formats and currencies (using HMRC October 2024 exchange rates)
- Flagged foreign transactions

2️⃣ Aggregation & Benchmarking

- Calculated mean/median spending per category per country
- Built user-level summaries comparing individual spending vs. national averages
- Defined an “over benchmark” condition (≥ 1.5× average)

3️⃣ JSON Export for App Integration

- Final output stored in `/Data-Science/processed_jsons/`, for SE to use directly.

4️⃣ Visualization

- Data scientists also generated visual insights (Matplotlib/Plotly):
- User vs. average bar charts
- Category spending pie charts
- Outlier detection visuals

## 💻 Software Engineering Process
**Core Features**

- Add, view, and delete expenses

- Validate form inputs (using /utils/constants.js)

- Compare personal spending with DS-provided benchmarks

- Display category-level insights (e.g., “You spent 18% above average on Food”)

**File Highlights**
- `/components/`: Core UI logic (ExpenseForm, Dashboard, Charts)

- `/blocks/`: Reusable layout blocks and containers

- `/utils/`: Data validation, formatting, and benchmark logic

- `/pages/`: Main app views and routing structure

## 🧰 Tech Stack

| Role                     | Tools & Libraries                                 |
| ------------------------ | ------------------------------------------------- |
| **Data Science**         | Python, Pandas, NumPy, Plotly, JSON, KaggleHub    |
| **Software Engineering** | HTML, CSS, JavaScript, React, LocalStorage        |
| **Shared**               | Git, GitHub, JSON integration, TripleTen workflow |

## 🚀 Installation
**Clone the repository**
```
git clone https://github.com/jeelfaldu7/Smart-Budget-Planner.git
cd Smart-Budget-Planner
```
## 📂 Key Outputs
| File                                                         | Description                      |
| ------------------------------------------------------------ | -------------------------------- |
| `/Data-Science/processed_jsons/all_countries_user_data.json` | Clean aggregated data for app    |
| `/Data-Science/processed_jsons/one_country_preview.json`     | USA-only dataset for testing     |
| `/Data-Science/visuals/`                                     | User vs. average spending charts |
| `/images/`                                                   | App icons and assets             |

## 🤝 Team Credits

**Data Science Team:**
- Jeel Faldu
- Raphael Lu

**Software Engineering Team:**
- Alfonso
- Gisell
- Vinod Jacob

**Guidance & Support:**
- TripleTen mentors and community
- Kaggle for dataset
- HMRC for exchange rates

## 📜 License
This project is licensed under the MIT License.

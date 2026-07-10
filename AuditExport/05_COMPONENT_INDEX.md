# Component Index

* `App` (`src/App.tsx`) - Main router container. State: Active tab, Sidebar status.
* `ProfessionalChat` (`src/components/ProfessionalChat.tsx`) - State: messages, attachments, chat input. Hooks: `useState`, `useRef`. Context: Global App State.
* `InstallationSetupCenter` (`src/components/InstallationSetupCenter.tsx`) - State: diagnostic results, wizard step.
* `SystemDashboard` (`src/components/monitoring/SystemDashboard.tsx`) - State: metrics chart data, hardware info.
* `EnterpriseBenchmarkDashboard` (`src/components/benchmark/EnterpriseBenchmarkDashboard.tsx`) - State: benchmark progress, scores.
* `SecurityDashboard` (`src/components/security/SecurityDashboard.tsx`) - State: vulnerability logs, vault access.
* `AppContent` (`src/components/layout/AppContent.tsx`) - Switcher for view rendering. Props: activeTab.
* `Sidebar` (`src/components/layout/Sidebar.tsx`) - Navigation rail. Props: activeTab, setActiveTab.

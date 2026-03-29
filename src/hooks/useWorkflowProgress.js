import { useState, useEffect, useCallback, useMemo } from "react";
import { isSuspiciousAccount } from "../constants/fraudThreshold";

const STORAGE_KEY = "watchdog_workflow_v1";

const STEPS = [
  {
    number: 1,
    title: "Generate Accounts",
    description: "Create dummy bank accounts and transactions for testing",
    path: "/add-accounts",
    icon: "fa-plus-circle",
  },
  {
    number: 2,
    title: "Get Data",
    description: "Load account data from bank into the center system",
    path: "/trackaccount",
    icon: "fa-download",
  },
  {
    number: 3,
    title: "Run Test",
    description: "Calculate fraud scores using machine learning",
    path: "/trackaccount",
    icon: "fa-vial",
  },
  {
    number: 4,
    title: "View Results",
    description: "Analyze fraud detection results and suspicious accounts",
    path: "/overview",
    icon: "fa-chart-line",
  },
];

function loadStored() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function saveStored(partial) {
  const next = { ...loadStored(), ...partial };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  window.dispatchEvent(new Event("watchdog-workflow-updated"));
}

export function useWorkflowProgress() {
  const [stored, setStored] = useState(() => loadStored());
  const [accounts, setAccounts] = useState([]);
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const sync = () => setStored(loadStored());
    window.addEventListener("watchdog-workflow-updated", sync);
    return () => window.removeEventListener("watchdog-workflow-updated", sync);
  }, []);

  const refreshInference = useCallback(async () => {
    const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
    if (!API_BASE_URL) {
      setLoading(false);
      return;
    }
    try {
      const [accRes, dashRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/accounts`),
        fetch(`${API_BASE_URL}/api/dashboard`),
      ]);
      if (accRes.ok) {
        const data = await accRes.json();
        setAccounts(Array.isArray(data) ? data : []);
      }
      if (dashRes.ok) {
        setDashboard(await dashRes.json());
      }
    } catch {
      // keep previous
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshInference();
  }, [refreshInference]);

  const step1Done = useMemo(() => {
    return accounts.length > 0 || stored.visitedAddAccounts === true;
  }, [accounts.length, stored.visitedAddAccounts]);

  const step2Done = useMemo(() => {
    const tx = dashboard?.totalTransactions ?? 0;
    return tx > 0 || stored.dataLoaded === true;
  }, [dashboard, stored.dataLoaded]);

  const step3Done = useMemo(() => {
    if (stored.testRun === true) return true;
    return accounts.some((a) => isSuspiciousAccount(a));
  }, [stored.testRun, accounts]);

  const step4Done = useMemo(() => {
    return stored.viewedOverview === true;
  }, [stored.viewedOverview]);

  const completedFlags = useMemo(
    () => [step1Done, step2Done, step3Done, step4Done],
    [step1Done, step2Done, step3Done, step4Done]
  );

  const activeStep = useMemo(() => {
    const idx = completedFlags.findIndex((done) => !done);
    return idx === -1 ? null : idx + 1;
  }, [completedFlags]);

  const currentStep = activeStep ?? 4;

  const nextAction = useMemo(() => {
    if (activeStep == null) {
      return {
        title: "Workflow complete",
        description: "Explore the overview or track accounts anytime.",
        path: "/overview",
        stepNumber: 4,
      };
    }
    const s = STEPS[activeStep - 1];
    return {
      title: s.title,
      description: s.description,
      path: s.path,
      stepNumber: s.number,
    };
  }, [activeStep]);

  const markVisitedAddAccounts = useCallback(() => {
    saveStored({ visitedAddAccounts: true });
    setStored(loadStored());
  }, []);

  const markDataLoaded = useCallback(() => {
    saveStored({ dataLoaded: true });
    setStored(loadStored());
  }, []);

  const markTestRun = useCallback(() => {
    saveStored({ testRun: true });
    setStored(loadStored());
  }, []);

  const markViewedOverview = useCallback(() => {
    saveStored({ viewedOverview: true });
    setStored(loadStored());
  }, []);

  return {
    steps: STEPS,
    currentStep,
    activeStep,
    completedSteps: completedFlags,
    nextAction,
    loading,
    refreshInference,
    markVisitedAddAccounts,
    markDataLoaded,
    markTestRun,
    markViewedOverview,
  };
}

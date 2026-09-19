"use client";

import styles from "./calculator.module.scss";
import React, { useState, useRef } from "react";
import RangeSlider from "react-bootstrap-range-slider";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface CalculatedData {
  principalAmount: number;
  rateOfInterest: number;
  tenureYear: number;
  selectedPayout: number;
  maturityAmount: number;
  interestEarned: number;
}

export default function Home() {
  const [principalAmount, setPrincipalAmount] = useState(100000);
  const [rateOfInterest, setRateOfInterest] = useState(7.5);
  const [tenureYear, setTenureYear] = useState(5);
  const [selectedPayout, setSelectedPayout] = useState(4);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);

  const [showResult, setShowResult] = useState(false);
  const [calculatedData, setCalculatedData] = useState<CalculatedData | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const payoutMonths = [
    { id: 1, duration: "Quarterly" },
    { id: 2, duration: "Half Yearly" },
    { id: 3, duration: "Yearly" },
    { id: 4, duration: "At maturity" },
  ];

  function principalCalculation(P: number, r: number, t: number) {
    if (!t || !r) return P;
    return P + (P * r * t) / 100;
  }

  const handleCalculate = () => {
    const maturity = Math.round(
      principalCalculation(principalAmount, rateOfInterest, tenureYear)
    );
    const interest = Math.round(maturity - principalAmount);

    setCalculatedData({
      principalAmount,
      rateOfInterest,
      tenureYear,
      selectedPayout,
      maturityAmount: maturity,
      interestEarned: interest,
    });
    setSelectedYear(tenureYear);
    setShowResult(true);

    setTimeout(() => {
      if (typeof window !== "undefined" && window.innerWidth < 992 && resultsRef.current) {
        resultsRef.current.scrollIntoView({ behavior: "smooth" });
      }
    }, 100);
  };

  const isModifiedSinceCalculation =
    showResult &&
    calculatedData !== null &&
    (principalAmount !== calculatedData.principalAmount ||
      rateOfInterest !== calculatedData.rateOfInterest ||
      tenureYear !== calculatedData.tenureYear ||
      selectedPayout !== calculatedData.selectedPayout);

  const activePrincipal = calculatedData ? calculatedData.principalAmount : principalAmount;
  const activeRate = calculatedData ? calculatedData.rateOfInterest : rateOfInterest;
  const activeTenure = calculatedData ? calculatedData.tenureYear : tenureYear;

  const displayYearsCount = Math.max(activeTenure || 5, 5);
  const chartLabels = Array.from({ length: displayYearsCount }, (_, i) => `${i + 1}`);

  const chartDataValues = chartLabels.map((_, i) => {
    const yr = i + 1;
    return Math.round((activePrincipal * (activeRate || 7.5) * yr) / 100);
  });

  const chartData = {
    labels: chartLabels,
    datasets: [
      {
        data: chartDataValues,
        backgroundColor: chartLabels.map((_, i) =>
          i + 1 === selectedYear ? "#3b2d25" : "#dfbe9f"
        ),
        hoverBackgroundColor: chartLabels.map((_, i) =>
          i + 1 === selectedYear ? "#2b1f18" : "#cfab89"
        ),
        borderRadius: {
          topLeft: 12,
          topRight: 12,
          bottomLeft: 4,
          bottomRight: 4,
        },
        borderSkipped: false,
        barPercentage: 0.65,
        categoryPercentage: 0.82,
      },
    ],
  };

  const chartOptions: ChartOptions<"bar"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: "#3b2d25",
        titleColor: "#ffffff",
        bodyColor: "#dfbe9f",
        padding: 10,
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          title: (items) => `Year ${items[0].label}`,
          label: (context) =>
            ` Cumulative Interest: ₹${Number(context.raw).toLocaleString("en-IN")}`,
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        border: {
          display: false,
        },
        ticks: {
          color: "#8a7565",
          font: {
            size: 13,
            weight: 500,
          },
          padding: 6,
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          display: false,
        },
        border: {
          display: false,
        },
        ticks: {
          color: "#8a7565",
          font: {
            size: 11,
          },
          padding: 8,
          callback: function (val) {
            return "₹" + Number(val).toLocaleString("en-IN");
          },
        },
      },
    },
    onClick: (_event, elements) => {
      if (elements.length > 0) {
        const index = elements[0].index;
        setSelectedYear((prev) => (prev === index + 1 ? null : index + 1));
      }
    },
  };

  return (
    <>
      <div className={`${styles.calculatorMainContainer} container`}>
        <div className="row p-4 align-items-stretch">
          <div className={`col-lg-6 col-12 ${styles.firstCol}`}>
            <h1>FD Calculator</h1>
            <p>
              Estimate how much your fixed deposit investment will grow over
              time.
            </p>

            <div className={`${styles.sliderSection} row`}>
              <div className="col-6">Deposit Amount</div>
              <div className="col-6 text-end">
                ₹{principalAmount.toLocaleString("en-IN")}
              </div>
            </div>
            <RangeSlider
              value={principalAmount}
              min={100000}
              max={1000000}
              step={5000}
              onChange={(changeEvent) =>
                setPrincipalAmount(Number(changeEvent.target.value))
              }
            />

            <div className={`${styles.sliderSection} row mt-3`}>
              <div className="col-6">Rate of return (%)</div>
              <div className="col-6 text-end">{rateOfInterest}%</div>
            </div>
            <RangeSlider
              value={rateOfInterest}
              min={5}
              max={15}
              step={0.1}
              onChange={(changeEvent) =>
                setRateOfInterest(Number(changeEvent.target.value))
              }
            />

            <div className="row mt-3 align-items-center">
              <div className={`${styles.returns} col-4`}>
                <h5>Interest Payout</h5>
                <p style={{ fontSize: "11px", color: "#796757" }}>
                  cumulative Rate of Returns is {rateOfInterest}%
                </p>
              </div>
              <div className={`${styles.duration} col-8`}>
                {payoutMonths.map((item) => (
                  <li
                    key={item.id}
                    className={selectedPayout === item.id ? styles.activePayout : ""}
                    onClick={() => setSelectedPayout(item.id)}
                  >
                    {item.duration}
                  </li>
                ))}
              </div>
            </div>

            <div className={`${styles.sliderSection} row mt-3`}>
              <div className="col-6">Time Period (Years)</div>
              <div className="col-6 text-end">{tenureYear} Years</div>
            </div>
            <RangeSlider
              value={tenureYear}
              min={1}
              max={10}
              step={1}
              onChange={(changeEvent) =>
                setTenureYear(Number(changeEvent.target.value))
              }
            />

            <button
              className={`btn ${styles.btnStyle} mt-4`}
              onClick={handleCalculate}
            >
              {showResult
                ? isModifiedSinceCalculation
                  ? "Recalculate"
                  : "Calculate"
                : "Calculate"}
            </button>
          </div>

          <div
            ref={resultsRef}
            className={`col-lg-6 col-12 ${styles.secondColum} mt-4 mt-lg-0`}
          >
            <div className="row">
              <div className={`${styles.amount} col-6`}>
                <h5>Maturity Amount</h5>
                <p style={{ minHeight: "36px" }}>
                  {calculatedData ? `₹${calculatedData.maturityAmount.toLocaleString("en-IN")}` : "—"}
                </p>
              </div>
              <div className={`${styles.amount} col-6`}>
                <h5>Interest Earned</h5>
                <p style={{ minHeight: "36px" }}>
                  {calculatedData ? `₹${calculatedData.interestEarned.toLocaleString("en-IN")}` : "—"}
                </p>
              </div>
            </div>

            <div className={styles.chartCard}>
              {calculatedData && (
                <div className={styles.chartLegend}>
                  <div
                    className={styles.legendItem}
                    onClick={() =>
                      setSelectedYear((prev) =>
                        prev ? null : calculatedData.tenureYear
                      )
                    }
                    title="Click to toggle selected year highlight"
                  >
                    <span className={styles.legendDotSelected}></span>
                    <span>Selected Year</span>
                  </div>
                  <div
                    className={styles.legendItem}
                    onClick={() => setSelectedYear(null)}
                    title="Click to view all years"
                  >
                    <span className={styles.legendDotOther}></span>
                    <span>Other Years</span>
                  </div>
                </div>
              )}

              <div className={styles.chartContainer}>
                {calculatedData ? (
                  <Bar data={chartData} options={chartOptions} />
                ) : (
                  <div
                    style={{
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#8a7565",
                    }}
                  >
                  </div>
                )}
              </div>
            </div>

            <div className={styles.actionCardsRow}>
              <div className={`${styles.actionCard} ${styles.brownCard}`}>
                <div className={styles.topRow}>
                  <span className={styles.badgePill}>Personalised</span>
                </div>
                <div className={styles.cardTitle}>
                  Check Suitable<br />Products For Your<br />Investment
                </div>
                <div className={styles.cardSubtitle}>
                  Exclusively For You
                </div>
              </div>

              <div className={`${styles.actionCard} ${styles.charcoalCard}`}>
                <div className={styles.topRow}>
                  <span></span>
                </div>
                <div className={styles.cardTitle}>
                  Need Help Finding<br />Right Product?
                </div>
                <div className={styles.cardSubtitle}>
                  Get Guidance From Wealth Manager
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
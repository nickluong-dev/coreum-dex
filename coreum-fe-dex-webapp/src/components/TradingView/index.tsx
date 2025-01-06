import { useEffect, useState } from "react";
import themes from "./tools/theme";
import { widget as Widget } from "../../vendor/tradingview/charting_library";
import { SologenicDataFeed } from "./tools/api";
import { DEFAULT_CONFIGS, getOverrides } from "./tools/config";
import { useChartTheme, useSaveAndClear, useMountChart } from "@/hooks";
// import { findToken, handleSwitchChange } from "@/utils";
import "./TradingView.scss";
import { useStore } from "@/state";

declare global {
  interface Window {
    tvWidget: any;
  }
}

const resolutions: { [key: string]: string } = {
  "1": "1",
  "3": "3",
  "5": "5",
  "15": "15",
  "30": "30",
  "1h": "1h",
  "3h": "3h",
  "6h": "6h",
  "12h": "12h",
  "1D": "1D",
  "3D": "3D",
  "1W": "1W",
  "60": "1h",
  "180": "3h",
  "360": "6h",
  "720": "12h",
};

const TradingView = ({ height }: { height: number | string }) => {
  const { market } = useStore();
  const localStorageChartResolution = localStorage.getItem("chart_resolution");
  const initialResolution = localStorageChartResolution
    ? String(localStorageChartResolution)
    : "1W";

  const [resolution, setResolution] = useState<string>(initialResolution);
  const [dataFeed, setDataFeed] = useState<SologenicDataFeed | null>(null);

  // default the local storage resolution to 1W
  // useEffect(() => {
  //   if (!localStorage.chart_resolution) {
  //     localStorage.chart_resolution = "1W";
  //   }
  //   if (
  //     !Object.keys(resolutions).includes(localStorage.chart_resolution) ||
  //     ["60", "360", "720"].includes(localStorage.chart_resolution)
  //   ) {
  //     localStorage.chart_resolution = "1W";
  //     setResolution("1W");
  //   }
  // }, []);

  // useEffect(() => {
  //   if (localStorage.chart_resolution) {
  //     if (["1", "3", "5", "15", "30"].includes(localStorage.chart_resolution)) {
  //       setSelectedMinutes({
  //         value: resolutions[localStorage.chart_resolution],
  //       });
  //       resolutions[localStorage.chart_resolution];
  //     } else if (
  //       ["1h", "3h", "6h", "12h"].includes(localStorage.chart_resolution)
  //     ) {
  //       setSelectedHours({
  //         value: resolutions[localStorage.chart_resolution],
  //       });
  //       setResolution(resolutions[localStorage.chart_resolution]);
  //     }
  //   }
  // }, []);

  const coreumConstructorFeed = () => {
    // const counter = `${market.counter.currency}${
    //   market.counter.issuer ? `+${market.counter.issuer}` : ""
    // }`;

    // const base = `${market.base.currency}${
    //   market.base.issuer ? `+${market.base.issuer}` : ""
    // }`;

    // const baseName = findToken({
    //   currency: market.base.currency,
    //   issuer: market.base.issuer,
    // })?.symbol;
    // const counterName = findToken({
    //   currency: market.counter.currency,
    //   issuer: market.counter.issuer,
    // })?.symbol;

    // return {
    //   id: base + "/" + counter,
    //   name: baseName?.toUpperCase() + "/" + counterName?.toUpperCase(),
    // };

    //TODO testing
    return {
      id: "test1/test2",
      name: "Coreum/USD",
    };
  };

  const mountChart = () => {
    const symbol = coreumConstructorFeed();
    const dataFeedInstance = new SologenicDataFeed(symbol);
    setDataFeed(dataFeedInstance);

    const widgetOptions = {
      // debug: true, // TV logs
      symbol: symbol.name,
      datafeed: dataFeedInstance,
      height: height,
      interval: resolution,
      theme: "Dark",
      loading_screen: {
        backgroundColor: themes["dark"].colors.chart.background,
        foregroundColor: "#D81D3C",
      },
      locale: "en",
      ...DEFAULT_CONFIGS,
    };
    const widget = (window.tvWidget = new Widget(widgetOptions as any));

    widget.onChartReady(() => {
      setTimeout(() => {
        widget
          .activeChart()
          .onIntervalChanged()
          .subscribe(null, (interval) => {
            updateResolution(interval);
          });
        widget.applyOverrides(getOverrides("dark"));
        setReady(true);
      }, 500);
    });
  };

  const updateResolution = (res: string) => {
    const widget = window.tvWidget;
    widget.chart().setResolution(res);

    // Resolve the resolution or default to '1W' if invalid
    const validResolutions = Object.keys(resolutions);
    const resolvedRes = validResolutions.includes(res)
      ? resolutions[res]
      : "1W";
    localStorage.chart_resolution = resolvedRes;
    setResolution(resolvedRes);

    // resubscribe to bars with the new resolution
    if (dataFeed) {
      dataFeed.subscriptions.forEach((sub) => {
        dataFeed.unsubscribeBars(sub.key);
        dataFeed.subscribeBars(
          sub.symbolInfo,
          res,
          sub.onRealtimeCallback,
          sub.key
        );
      });
    }
  };

  const openIndicators = () => {
    const widget = window.tvWidget;
    widget?.chart().executeActionById("insertIndicator");
  };

  const startFullScreen = () => {
    const widget = window.tvWidget;
    widget?.activeChart()._chartWidget._chartWidgetCollection.startFullscreen();
  };

  const { chartReady, setReady } = useMountChart(mountChart);
  const { clearable, saveChart, clearChart } = useSaveAndClear(
    mountChart,
    setReady
  );

  // useChartTheme(chartReady);

  return (
    <div className="chart-wrapper">
      {/* <div className="top-toolbar">
        <div className="intervals">
          <Selector
            value={selectedMinutes || { value: "" }}
            onChange={(e?: { [value: string]: string }) => {
              if (!e) return;
              const minute = e?.value.split("m")[0];
              if (!minute) return;
              setSelectedMinutes(e);
              updateResolution(minute);
            }}
            options={minutes}
            optionClassname="toolbar-selector-option"
            height={24}
            width={80}
            dropdownWidth={80}
            optionLabelKey="value"
            placeholder={t("_min")}
            valueClassname={
              Number(selectedMinutes?.value?.split("m")[0]) ==
              localStorage.chart_resolution
                ? "toolbar-selector active"
                : "toolbar-selector"
            }
          />

          <Selector
            value={selectedHours || { value: "" }}
            onChange={(e?: { value: string }) => {
              if (!e) return;
              setSelectedHours(e);
              updateResolution(e.value);
            }}
            options={hours}
            optionClassname="toolbar-selector-option"
            height={24}
            width={90}
            dropdownWidth={90}
            dropdownHeight={160}
            optionLabelKey="value"
            placeholder={t("_hour")}
            valueClassname={
              selectedHours?.value == localStorage.chart_resolution
                ? "toolbar-selector active"
                : "toolbar-selector"
            }
          />
          <div
            onClick={() => updateResolution("1D")}
            className={`interval-btn ${resolution === "1D" ? "active" : ""}`}
          >
            <p>{t("_day")}</p>
          </div>
          <div
            onClick={() => {
              updateResolution("3D");
            }}
            className={`interval-btn ${resolution === "3D" ? "active" : ""}`}
          >
            <p>{t("_3day")}</p>
          </div>
          <div
            onClick={() => updateResolution("1W")}
            className={`interval-btn ${resolution === "1W" ? "active" : ""}`}
          >
            <p>{t("_week")}</p>
          </div>
          <div
            onClick={() => openIndicators()}
            className="interval-btn indicators"
          >
            <p>{t("_technicalInd")}</p>
          </div>
        </div>
        {userLayout[selectedLayout].name === LAYOUTS.CUSTOM && (
          <div
            className="draggableHandle"
            style={{
              height: "100%",
              width: "100%",
              flex: 1,
              position: "relative",
              zIndex: 1,
            }}
          />
        )}
        <div className="icons">
          <div className="fs-btn" onClick={saveChart}>
            <img src={`/trade/images/chart-save.svg`} alt="save" />
          </div>
          {clearable && (
            <div className="fs-btn" onClick={clearChart}>
              <img src={`/trade/images/chart-delete.svg`} alt="delete" />
            </div>
          )}
          <div className="fs-btn" onClick={startFullScreen}>
            <img src={`/trade/images/chart-fullscreen.svg`} alt="fullscreen" />
          </div>

          {selectedLayout === LAYOUTS.CUSTOM && (
            <IconButton
              wrapperClass="close-icon"
              iconSize={16}
              size={16}
              icon={<img src={images[theme].close} alt="close-icon" />}
              onClick={() => {
                handleSwitchChange(LAYOUTS_OPTIONS.CHARTS);
              }}
            />
          )}
        </div>
      </div> */}
      {!chartReady && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100%",
            width: "100%",
          }}
        >
          loading...
        </div>
      )}
      <div
        id="chartContainer"
        className="chart-container"
        style={{ display: chartReady ? "initial" : "none" }}
      />
    </div>
  );
};

export default TradingView;

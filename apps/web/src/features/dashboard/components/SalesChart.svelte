<script lang="ts">
  import { formatCurrency } from '../../../lib/utils/currency';

  interface TrendData {
    dateStr: string;
    amount: number;
    profit: number;
  }

  interface Props {
    salesTrend: TrendData[];
  }

  let { salesTrend }: Props = $props();

  // SVG Dimensions
  const width = 600;
  const height = 240;
  const padLeft = 55;
  const padRight = 15;
  const padTop = 20;
  const padBottom = 30;

  const chartWidth = width - padLeft - padRight;
  const chartHeight = height - padTop - padBottom;

  // Calculate Max Value (with 15% headroom)
  const maxVal = $derived(
    Math.max(...salesTrend.map((d) => Math.max(d.amount, d.profit, 100000))) * 1.15
  );

  // Generate Coordinates
  const xCoords = $derived(
    salesTrend.map((_, i) => padLeft + i * (chartWidth / Math.max(salesTrend.length - 1, 1)))
  );
  const yCoordsSales = $derived(
    salesTrend.map((d) => padTop + chartHeight - (d.amount / maxVal) * chartHeight)
  );
  const yCoordsProfit = $derived(
    salesTrend.map((d) => padTop + chartHeight - (d.profit / maxVal) * chartHeight)
  );

  // Path strings
  const salesLinePath = $derived(
    salesTrend.length > 0
      ? `M ${xCoords[0]} ${yCoordsSales[0]} ` +
          xCoords.map((x, i) => `L ${x} ${yCoordsSales[i]}`).join(' ')
      : ''
  );

  const salesAreaPath = $derived(
    salesTrend.length > 0
      ? `${salesLinePath} L ${xCoords[xCoords.length - 1]} ${padTop + chartHeight} L ${xCoords[0]} ${padTop + chartHeight} Z`
      : ''
  );

  const profitLinePath = $derived(
    salesTrend.length > 0
      ? `M ${xCoords[0]} ${yCoordsProfit[0]} ` +
          xCoords.map((x, i) => `L ${x} ${yCoordsProfit[i]}`).join(' ')
      : ''
  );

  const profitAreaPath = $derived(
    salesTrend.length > 0
      ? `${profitLinePath} L ${xCoords[xCoords.length - 1]} ${padTop + chartHeight} L ${xCoords[0]} ${padTop + chartHeight} Z`
      : ''
  );

  // Y-axis grid values
  const yGridTicks = $derived([0, 0.25, 0.5, 0.75, 1].map((pct) => maxVal * pct));

  function formatShortCurrency(val: number) {
    if (val >= 1000000) return 'Rp ' + (val / 1000000).toFixed(1) + 'Jt';
    if (val >= 1000) return 'Rp ' + (val / 1000).toFixed(0) + 'Rup';
    return 'Rp ' + val.toString();
  }

  // Interactive tooltip state
  let hoveredIndex = $state<number | null>(null);
  let containerRef = $state<HTMLDivElement | null>(null);
</script>

<div
  class="relative w-full bg-base/90 dark:bg-surface/50 border border-slate-200/80 dark:border-emerald-950/80 rounded-2xl p-4 sm:p-5 shadow-2xs text-ink"
  bind:this={containerRef}
>
  <!-- Chart Header -->
  <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
    <div>
      <h3 class="text-xs font-bold text-slate-400 dark:text-emerald-500/70 uppercase tracking-wider">
        Grafik Tren Mingguan
      </h3>
      <p class="text-sm sm:text-base font-extrabold text-slate-800 dark:text-emerald-100 mt-0.5">
        Analisis Penjualan & Profit Bersih
      </p>
    </div>

    <div class="flex items-center gap-4 text-xs">
      <div class="flex items-center gap-2">
        <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-xs"></span>
        <span class="font-semibold text-slate-600 dark:text-slate-300">Penjualan</span>
      </div>
      <div class="flex items-center gap-2">
        <span class="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-xs"></span>
        <span class="font-semibold text-slate-600 dark:text-slate-300">Profit</span>
      </div>
    </div>
  </div>

  <!-- SVG Chart Area -->
  <div class="relative w-full h-57.5 select-none">
    <svg viewBox="0 0 {width} {height}" class="w-full h-full overflow-visible">
      <defs>
        <!-- Sales Area Gradient -->
        <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#10B981" stop-opacity="0.25" />
          <stop offset="100%" stop-color="#10B981" stop-opacity="0.0" />
        </linearGradient>
        <!-- Profit Area Gradient -->
        <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#F59E0B" stop-opacity="0.2" />
          <stop offset="100%" stop-color="#F59E0B" stop-opacity="0.0" />
        </linearGradient>
      </defs>

      <!-- Y-Axis Gridlines & Labels -->
      {#each yGridTicks as val}
        {@const y = padTop + chartHeight - (val / maxVal) * chartHeight}
        <g class="transition-all duration-300">
          <line
            x1={padLeft}
            y1={y}
            x2={width - padRight}
            y2={y}
            stroke="rgba(148, 163, 184, 0.2)"
            stroke-width="1"
            stroke-dasharray={val === 0 ? '0' : '4 4'}
          />
          <text
            x={padLeft - 8}
            y={y + 3.5}
            text-anchor="end"
            class="text-[10px] font-medium fill-slate-400 dark:fill-slate-400 font-mono tracking-tight"
          >
            {formatShortCurrency(val)}
          </text>
        </g>
      {/each}

      <!-- X-Axis Labels -->
      {#each salesTrend as pt, i}
        <text
          x={xCoords[i]}
          y={height - 6}
          text-anchor="middle"
          class="text-[10px] font-medium fill-slate-500 dark:fill-slate-400"
        >
          {pt.dateStr}
        </text>
      {/each}

      <!-- Gradient Area Fills -->
      {#if salesAreaPath}
        <path d={salesAreaPath} fill="url(#salesGrad)" />
      {/if}
      {#if profitAreaPath}
        <path d={profitAreaPath} fill="url(#profitGrad)" />
      {/if}

      <!-- Smooth Lines -->
      {#if salesLinePath}
        <path
          d={salesLinePath}
          fill="none"
          stroke="#10B981"
          stroke-width="2.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      {/if}
      {#if profitLinePath}
        <path
          d={profitLinePath}
          fill="none"
          stroke="#F59E0B"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-dasharray="3 3"
        />
      {/if}

      <!-- Guideline & Hover Circles -->
      {#if hoveredIndex !== null}
        {@const hX = xCoords[hoveredIndex]}
        <line
          x1={hX}
          y1={padTop}
          x2={hX}
          y2={padTop + chartHeight}
          stroke="rgba(16, 185, 129, 0.4)"
          stroke-width="1.5"
          stroke-dasharray="3 3"
        />

        <!-- Sales Circle Dot -->
        <circle
          cx={hX}
          cy={yCoordsSales[hoveredIndex]}
          r="5.5"
          fill="#10B981"
          stroke="white"
          stroke-width="2"
        />

        <!-- Profit Circle Dot -->
        <circle
          cx={hX}
          cy={yCoordsProfit[hoveredIndex]}
          r="5.5"
          fill="#F59E0B"
          stroke="white"
          stroke-width="2"
        />
      {/if}

      <!-- Interactive Hover Hitboxes -->
      {#each salesTrend as pt, i}
        <!-- svelte-ignore a11y_no_static_element_interactions -->
        <rect
          x={xCoords[i] - 25}
          y={padTop}
          width={50}
          height={chartHeight}
          fill="transparent"
          class="cursor-pointer"
          onmouseenter={() => (hoveredIndex = i)}
          onmouseleave={() => (hoveredIndex = null)}
        />
      {/each}
    </svg>

    <!-- Tooltip Popup -->
    {#if hoveredIndex !== null}
      {@const pt = salesTrend[hoveredIndex]}
      {@const tooltipX = xCoords[hoveredIndex]}
      {@const isRightSide = hoveredIndex > salesTrend.length / 2}
      <div
        class="absolute bg-slate-900/95 dark:bg-slate-950/95 backdrop-blur-md text-white rounded-xl p-3 shadow-xl border border-slate-800 text-[11px] flex flex-col gap-1.5 pointer-events-none transition-all duration-150 z-30 min-w-37.5"
        style="
          top: {Math.min(yCoordsSales[hoveredIndex] - 45, chartHeight - 30)}px;
          {isRightSide ? `right: ${width - tooltipX + 8}px` : `left: ${tooltipX + 8}px`};
        "
      >
        <span class="font-extrabold text-slate-400 uppercase tracking-wider text-[10px]">
          {pt.dateStr}
        </span>
        <div class="flex items-center justify-between gap-2">
          <div class="flex items-center gap-1.5">
            <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span class="text-slate-300">Penjualan:</span>
          </div>
          <strong class="font-mono text-emerald-400">{formatCurrency(pt.amount)}</strong>
        </div>
        <div class="flex items-center justify-between gap-2">
          <div class="flex items-center gap-1.5">
            <span class="w-2 h-2 rounded-full bg-amber-400"></span>
            <span class="text-slate-300">Profit:</span>
          </div>
          <strong class="font-mono text-amber-400">{formatCurrency(pt.profit)}</strong>
        </div>
      </div>
    {/if}
  </div>
</div>

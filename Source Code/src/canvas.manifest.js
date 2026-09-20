export const manifest = {
  screens: {
    scr_5oyshq: { name: "Purchase requests", route: "/requests", position: { "x": 160, "y": 1820 } },
    scr_xkmd8s: { name: "New request (Flow A)", route: "/requests/new", position: { "x": 1560, "y": 1820 } },
    scr_w6zquu: { name: "Draft request", route: "/requests/PR-2026-035", position: { "x": 2960, "y": 1820 } },
    scr_kp69xh: { name: "Edit draft request", route: "/requests/PR-2026-035/edit", position: { "x": 4360, "y": 1820 } },
    scr_c8728f: { name: "Submission error", route: "/requests/PR-2026-034", position: { "x": 160, "y": 3800 } },
    scr_5drum6: { name: "Approvals queue (Flow B)", route: "/approvals", position: { "x": 160, "y": 5780 } },
    scr_tvrqrr: { name: "Approval + budget warning", route: "/requests/PR-2026-041", position: { "x": 1560, "y": 5780 } },
    scr_i4w095: { name: "Edit locked (in approval)", route: "/requests/PR-2026-041/edit", position: { "x": 2960, "y": 5780 } },
    scr_b1edom: { name: "Budget review (Finance)", route: "/budget", position: { "x": 160, "y": 7760 } },
    scr_urw471: { name: "Finance budget decision", route: "/requests/PR-2026-042", position: { "x": 1560, "y": 7760 } },
    scr_ka3yga: { name: "Revision required", route: "/requests/PR-2026-037", position: { "x": 1560, "y": 3800 } },
    scr_8ye38r: { name: "Edit after revision", route: "/requests/PR-2026-037/edit", position: { "x": 5760, "y": 3800 } },
    scr_qg0zx5: { name: "Rejected request", route: "/requests/PR-2026-036", position: { "x": 2960, "y": 3800 } },
    scr_l49ohx: { name: "Approved request", route: "/requests/PR-2026-040", position: { "x": 4360, "y": 3800 } },
    scr_p488tu: { name: "Sourcing (Flow C)", route: "/sourcing", position: { "x": 160, "y": 9740 } },
    scr_zub9lq: { name: "Collect quotation (upload)", route: "/sourcing/PR-2026-040/collect", position: { "x": 7160, "y": 9740 } },
    scr_c0c7m7: { name: "Comparison not ready yet", route: "/sourcing/PR-2026-040", position: { "x": 8560, "y": 9740 } },
    scr_mflj5m: { name: "Suppliers (Flow C)", route: "/suppliers", position: { "x": 4360, "y": 9740 } },
    scr_o3b1fa: { name: "Comparison + expiry warning", route: "/sourcing/PR-2026-039", position: { "x": 1560, "y": 9740 } },
    scr_ihtmay: { name: "AI analysis + anomaly (Flow D)", route: "/sourcing/PR-2026-038", position: { "x": 2960, "y": 9740 } },
    scr_j1u439: { name: "Awarded → create PO", route: "/sourcing/PR-2026-032", position: { "x": 5760, "y": 9740 } },
    scr_j9jxhf: { name: "Purchase orders", route: "/orders", position: { "x": 160, "y": 11720 } },
    scr_m2hnqh: { name: "PO issued — receive goods", route: "/orders/PO-2026-018", position: { "x": 1560, "y": 11720 } },
    scr_j6ll73: { name: "PO closed", route: "/orders/PO-2026-017", position: { "x": 2960, "y": 11720 } },
    scr_3vxfwl: { name: "Prototype assumptions", route: "/assumptions", position: { "x": 0, "y": 0 }, isDefaultRow: true }
  },
  sections: {
    sec_ttc7c1: { name: "Request creation", x: 0, y: 1600, width: 5720, height: 1180 },
    sec_3036sm: { name: "Request outcomes", x: 0, y: 3580, width: 7120, height: 1180 },
    sec_lyreya: { name: "Approvals workflow", x: 0, y: 5560, width: 4320, height: 1180 },
    sec_ar6q1w: { name: "Budget review", x: 0, y: 7540, width: 2920, height: 1180 },
    sec_nq85dn: { name: "Sourcing & vendor selection", x: 0, y: 9520, width: 9920, height: 1180 },
    sec_6knlks: { name: "Purchase order fulfillment", x: 0, y: 11500, width: 4320, height: 1180 }
  },
  layers: [
  { kind: "screen", id: "scr_3vxfwl" },
  { kind: "section", id: "sec_ttc7c1", children: [
    { kind: "screen", id: "scr_5oyshq" },
    { kind: "screen", id: "scr_xkmd8s" },
    { kind: "screen", id: "scr_w6zquu" },
    { kind: "screen", id: "scr_kp69xh" }]
  },
  { kind: "section", id: "sec_3036sm", children: [
    { kind: "screen", id: "scr_c8728f" },
    { kind: "screen", id: "scr_ka3yga" },
    { kind: "screen", id: "scr_qg0zx5" },
    { kind: "screen", id: "scr_l49ohx" },
    { kind: "screen", id: "scr_8ye38r" }]
  },
  { kind: "section", id: "sec_lyreya", children: [
    { kind: "screen", id: "scr_5drum6" },
    { kind: "screen", id: "scr_tvrqrr" },
    { kind: "screen", id: "scr_i4w095" }]
  },
  { kind: "section", id: "sec_ar6q1w", children: [
    { kind: "screen", id: "scr_b1edom" },
    { kind: "screen", id: "scr_urw471" }]
  },
  { kind: "section", id: "sec_nq85dn", children: [
    { kind: "screen", id: "scr_p488tu" },
    { kind: "screen", id: "scr_o3b1fa" },
    { kind: "screen", id: "scr_ihtmay" },
    { kind: "screen", id: "scr_mflj5m" },
    { kind: "screen", id: "scr_j1u439" },
    { kind: "screen", id: "scr_zub9lq" },
    { kind: "screen", id: "scr_c0c7m7" }]
  },
  { kind: "section", id: "sec_6knlks", children: [
    { kind: "screen", id: "scr_j9jxhf" },
    { kind: "screen", id: "scr_m2hnqh" },
    { kind: "screen", id: "scr_j6ll73" }]
  }]

};
import { ReportType } from "../Domain/enums/ReportType";

export function toCsv(type: ReportType, summary: any): { filename: string; content: string; contentType: string } {
  const now = new Date().toISOString().slice(0, 10);
  switch (type) {
    case ReportType.SALES: {
      const lines: string[] = [];
      lines.push("metric,value");
      lines.push(`totalCount,${summary.totalCount}`);
      lines.push(`totalAmount,${Number(summary.totalAmount ?? 0).toFixed(2)}`);
      lines.push(`averageAmount,${Number(summary.averageAmount ?? 0).toFixed(2)}`);
      lines.push("");
      lines.push("byPaymentMethod,amount,count,avg");
      (summary.byPaymentMethod ?? []).forEach((p: any) =>
        lines.push(`${p.paymentMethod},${Number(p.totalAmount ?? 0).toFixed(2)},${p.count},${Number(p.averageAmount ?? 0).toFixed(2)}`)
      );
      lines.push("");
      lines.push("bySaleType,amount,count,avg");
      (summary.bySaleType ?? []).forEach((p: any) =>
        lines.push(`${p.saleType},${Number(p.totalAmount ?? 0).toFixed(2)},${p.count},${Number(p.averageAmount ?? 0).toFixed(2)}`)
      );
      return { filename: `sales-report-${now}.csv`, content: lines.join("\n"), contentType: "text/csv" };
    }
    case ReportType.PLANTS: {
      const lines: string[] = [];
      lines.push("metric,value");
      lines.push(`totalSpecies,${summary.totalSpecies ?? 0}`);
      lines.push(`totalQuantity,${summary.totalQuantity ?? 0}`);
      lines.push(`averageOilStrength,${Number(summary.averageOilStrength ?? 0).toFixed(2)}`);
      lines.push("");
      lines.push("byState,count,quantity");
      (summary.byState ?? []).forEach((p: any) => lines.push(`${p.state},${p.count},${p.quantity}`));
      return { filename: `plants-report-${now}.csv`, content: lines.join("\n"), contentType: "text/csv" };
    }
    case ReportType.PERFUMES: {
      const lines: string[] = [];
      lines.push("metric,value");
      lines.push(`totalCount,${summary.totalCount ?? 0}`);
      lines.push(`averageVolume,${Number(summary.averageVolume ?? 0).toFixed(2)}`);
      lines.push("");
      lines.push("byType,count,avgVolume");
      (summary.byType ?? []).forEach((p: any) => lines.push(`${p.type},${p.count},${Number(p.averageVolume ?? 0).toFixed(2)}`));
      return { filename: `perfumes-report-${now}.csv`, content: lines.join("\n"), contentType: "text/csv" };
    }
    case ReportType.USERS: {
      const lines: string[] = [];
      lines.push("metric,value");
      lines.push(`totalCount,${summary.totalCount ?? 0}`);
      lines.push("");
      lines.push("byRole,count");
      (summary.byRole ?? []).forEach((p: any) => lines.push(`${p.role},${p.count}`));
      return { filename: `users-report-${now}.csv`, content: lines.join("\n"), contentType: "text/csv" };
    }
    default:
      throw new Error("Nepoznat tip izveštaja za CSV");
  }
}

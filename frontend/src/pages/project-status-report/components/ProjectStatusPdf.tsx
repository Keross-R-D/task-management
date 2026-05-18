import {
    Document,
    Page,
    Text,
    View,
    StyleSheet,
} from "@react-pdf/renderer";

interface OverdueTask {
    sprintName: string;
    plannedStartDate: string,
    plannedEndDate: string;
    overdueDays: number;
    progress: number;
}

interface WeeklySprint {
    sprintName: string;
    plannedEndDate: string;
}

interface ProjectStatusPdfProps {
    project: {
        projectName: string;
        startDate: string;
        endDate: string;
        projectStatus: string;
        progress: number;
        estimatedHours: number;
        actualHours: number;
        overallStatus: "ON_TIME" | "SLIGHT_DELAY" | "DELAY";
    };

    executiveSummary: {
        runningOutOfTime: number;
        risks: number;
        completedTasks: number;
        remainingTasks: number;
        totalTasks: number;
    };

    overdueTasks: OverdueTask[];

    currentWeek: WeeklySprint[];
    previousWeek: WeeklySprint[];
    upcomingWeek: WeeklySprint[];

    risks?: string[];
    issues?: string[];
    remarks?: string;
}

const colors = {
    background: "#ffffff",
    card: "#f8fafc",
    border: "#000",
    text: "#111827",
    muted: "#6b7280",
    cyan: "#0891b2",
    green: "#16a34a",
    yellow: "#ca8a04",
    red: "#dc2626",
    blue: "#2563eb",
};

const styles = StyleSheet.create({
    page: {
        backgroundColor: colors.background,
        color: colors.text,
        padding: 24,
        fontSize: 11,
        fontFamily: "Helvetica",
    },

    header: {
        marginBottom: 20,
        borderBottom: `1px solid ${colors.border}`,
        paddingBottom: 12,
    },

    title: {
        fontSize: 24,
        fontWeight: 700,
        marginBottom: 6,
    },

    subtitle: {
        color: colors.muted,
        fontSize: 11,
    },

    section: {
        marginBottom: 16,
        border: `1px solid ${colors.border}`,
        borderRadius: 8,
        overflow: "hidden",
    },

    sectionHeader: {
        backgroundColor: colors.cyan,
        padding: 10,
    },

    sectionHeaderText: {
        fontSize: 15,
        fontWeight: 700,
        color: "#ffffff",
    },

    sectionBody: {
        padding: 14,
        backgroundColor: colors.card,
    },

    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 10,
    },

    column: {
        width: "48%",
    },

    label: {
        color: colors.muted,
        marginBottom: 2,
    },

    value: {
        color: colors.text,
        fontWeight: 600,
    },

    badge: {
        paddingVertical: 4,
        paddingHorizontal: 4,
        borderRadius: 4,
        fontSize: 10,
        fontWeight: 700,
        color: "#fff",
    },

    summaryItem: {
        marginBottom: 10,
        fontSize: 11,
    },

    tableHeader: {
        flexDirection: "row",
        backgroundColor: colors.muted,
        color: "#fff",
        paddingVertical: 8,
        paddingHorizontal: 6,
        borderBottom: `1px solid ${colors.border}`,
    },

    tableRow: {
        flexDirection: "row",
        paddingVertical: 8,
        paddingHorizontal: 6,
        borderBottom: `1px solid ${colors.border}`,
    },

    cell: {
        flex: 1,
        fontSize: 10,
    },

    centered: {
        textAlign: "center",
    },

    noData: {
        textAlign: "center",
        color: colors.muted,
        paddingVertical: 20,
    },

    footer: {
        marginTop: 20,
        textAlign: "center",
        color: colors.muted,
        fontSize: 10,
    },
});

const getStatusColor = (
    status: "ON_TIME" | "SLIGHT_DELAY" | "DELAY"
) => {
    switch (status) {
        case "ON_TIME":
            return colors.green;

        case "SLIGHT_DELAY":
            return colors.yellow;

        case "DELAY":
            return colors.red;

        default:
            return colors.blue;
    }
};

export default function ProjectStatusPdf({
    project,
    executiveSummary,
    overdueTasks,
    currentWeek,
    previousWeek,
    upcomingWeek,
    risks = [],
    issues = [],
    remarks = "",
}: ProjectStatusPdfProps) {
    return (
        <Document>
            <Page size="A3" style={styles.page} wrap>

                {/* HEADER */}
                <View style={styles.header}>
                    <Text style={styles.title}>
                        Project Status Report
                    </Text>

                    <Text style={styles.subtitle}>
                        {project.startDate} - {project.endDate}
                    </Text>
                </View>

                {/* PROJECT DETAILS */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionHeaderText}>
                            Project Details
                        </Text>
                    </View>

                    <View style={styles.sectionBody}>
                        <View style={styles.row}>
                            <View style={styles.column}>
                                <Text style={styles.label}>Project</Text>
                                <Text style={styles.value}>
                                    {project.projectName}
                                </Text>
                            </View>

                            <View style={styles.column}>
                                <Text style={styles.label}>Overall Status</Text>

                                <Text
                                    style={{
                                        ...styles.badge,
                                        backgroundColor: getStatusColor(
                                            project.overallStatus
                                        ),
                                    }}
                                >
                                    {project.overallStatus.replace("_", " ")}
                                </Text>
                            </View>
                        </View>

                        <View style={styles.row}>
                            <View style={styles.column}>
                                <Text style={styles.label}>Status</Text>
                                <Text style={styles.value}>
                                    {project.projectStatus}
                                </Text>
                            </View>

                            <View style={styles.column}>
                                <Text style={styles.label}>Progress</Text>
                                <Text style={styles.value}>
                                    {project.progress}%
                                </Text>
                            </View>
                        </View>

                        <View style={styles.row}>
                            <View style={styles.column}>
                                <Text style={styles.label}>Estimated Hours</Text>
                                <Text style={styles.value}>
                                    {project.estimatedHours}h
                                </Text>
                            </View>

                            <View style={styles.column}>
                                <Text style={styles.label}>Actual Hours</Text>
                                <Text style={styles.value}>
                                    {project.actualHours}h
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* EXECUTIVE SUMMARY */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionHeaderText}>
                            Executive Summary
                        </Text>
                    </View>

                    <View style={styles.sectionBody}>
                        <Text
                            style={{
                                ...styles.summaryItem,
                                color:
                                    executiveSummary.runningOutOfTime > 0
                                        ? colors.red
                                        : colors.green,
                            }}
                        >
                            • {executiveSummary.runningOutOfTime} sprint(s) running out of time
                        </Text>

                        <Text
                            style={{
                                ...styles.summaryItem,
                                color:
                                    executiveSummary.risks > 0
                                        ? colors.yellow
                                        : colors.green,
                            }}
                        >
                            • {executiveSummary.risks} risk(s) associated with project
                        </Text>

                        <Text
                            style={{
                                ...styles.summaryItem,
                                color: colors.blue,
                            }}
                        >
                            • {executiveSummary.completedTasks}/
                            {executiveSummary.totalTasks} tasks completed
                        </Text>
                    </View>
                </View>

                {/* OVERDUE TASKS */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionHeaderText}>
                            Overdue Tasks
                        </Text>
                    </View>

                    <View style={styles.sectionBody}>
                        {overdueTasks.length === 0 ? (
                            <Text style={styles.noData}>
                                No overdue tasks available
                            </Text>
                        ) : (
                            <>
                                <View style={styles.tableHeader}>
                                    <Text style={styles.cell}>Sprint</Text>
                                    <Text style={styles.cell}>Start Date</Text>
                                    <Text style={styles.cell}>End Date</Text>
                                    <Text style={styles.cell}>Overdue</Text>
                                    <Text style={styles.cell}>Progress</Text>
                                </View>

                                {overdueTasks.map((task, index) => (
                                    <View key={index} style={styles.tableRow}>
                                        <Text style={styles.cell}>
                                            {task.sprintName}
                                        </Text>

                                        <Text style={styles.cell}>
                                            {task.plannedStartDate}
                                        </Text>

                                        <Text style={styles.cell}>
                                            {task.plannedEndDate}
                                        </Text>

                                        <Text
                                            style={{
                                                ...styles.cell,
                                                color: colors.red,
                                            }}
                                        >
                                            {task.overdueDays} days
                                        </Text>

                                        <Text style={styles.cell}>
                                            {task.progress}%
                                        </Text>
                                    </View>
                                ))}
                            </>
                        )}
                    </View>
                </View>

                {/* PREVIOUS WEEK */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionHeaderText}>
                            Previous Week
                        </Text>
                    </View>

                    <View style={styles.sectionBody}>
                        {previousWeek.length === 0 ? (
                            <Text style={styles.noData}>
                                No data available
                            </Text>
                        ) : (
                            <>
                                <View style={styles.tableHeader}>
                                    <Text style={styles.cell}>Sprint Name</Text>
                                    <Text style={styles.cell}>Planned End Date</Text>
                                </View>
                                {previousWeek.map((item, index) => (
                                    <View key={index} style={styles.tableRow}>
                                        <Text style={styles.cell}>
                                            {item.sprintName}
                                        </Text>

                                        <Text style={styles.cell}>
                                            {item.plannedEndDate}
                                        </Text>
                                    </View>
                                ))}
                            </>
                        )}
                    </View>
                </View>

                {/* CURRENT WEEK */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionHeaderText}>
                            Current Week
                        </Text>
                    </View>

                    <View style={styles.sectionBody}>
                        {currentWeek.length === 0 ? (
                            <Text style={styles.noData}>
                                No data available
                            </Text>
                        ) : (
                            <>
                                <View style={styles.tableHeader}>
                                    <Text style={styles.cell}>Sprint Name</Text>
                                    <Text style={styles.cell}>Planned End Date</Text>
                                </View>
                                {currentWeek.map((item, index) => (
                                <View key={index} style={styles.tableRow}>
                                    <Text style={styles.cell}>
                                        {item.sprintName}
                                    </Text>
                                    <Text style={styles.cell}>
                                        {item.plannedEndDate}
                                    </Text>
                                </View>
                            ))}
                            </>
                        )}
                    </View>
                </View>

                {/* UPCOMING WEEK */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionHeaderText}>
                            Upcoming Week
                        </Text>
                    </View>

                    <View style={styles.sectionBody}>
                        {upcomingWeek.length === 0 ? (
                            <Text style={styles.noData}>
                                No data available
                            </Text>
                        ) : (
                            <>
                                <View style={styles.tableHeader}>
                                    <Text style={styles.cell}>Sprint Name</Text>
                                    <Text style={styles.cell}>Planned End Date</Text>
                                </View>
                                {upcomingWeek.map((item, index) => (
                                    <View key={index} style={styles.tableRow}>
                                        <Text style={styles.cell}>
                                            {item.sprintName}
                                        </Text>
                                        <Text style={styles.cell}>
                                            {item.plannedEndDate}
                                        </Text>
                                    </View>
                                ))}
                            </>
                            
                        )}
                    </View>
                </View>

                {/* RISKS */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionHeaderText}>
                            Risks
                        </Text>
                    </View>

                    <View style={styles.sectionBody}>
                        {risks.length === 0 ? (
                            <Text style={styles.noData}>
                                No risks available
                            </Text>
                        ) : (
                            risks.map((risk, index) => (
                                <Text
                                    key={index}
                                    style={{
                                        marginBottom: 8,
                                        color: colors.yellow,
                                    }}
                                >
                                    • {risk}
                                </Text>
                            ))
                        )}
                    </View>
                </View>

                {/* ISSUES */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionHeaderText}>
                            Issues
                        </Text>
                    </View>

                    <View style={styles.sectionBody}>
                        {issues.length === 0 ? (
                            <Text style={styles.noData}>
                                No issues available
                            </Text>
                        ) : (
                            issues.map((issue, index) => (
                                <Text
                                    key={index}
                                    style={{
                                        marginBottom: 8,
                                        color: colors.red,
                                    }}
                                >
                                    • {issue}
                                </Text>
                            ))
                        )}
                    </View>
                </View>

                {/* REMARKS */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionHeaderText}>
                            Remarks
                        </Text>
                    </View>

                    <View style={styles.sectionBody}>
                        <Text
                            style={{
                                color: colors.text,
                                lineHeight: 1.5,
                            }}
                        >
                            {remarks || "No remarks added."}
                        </Text>
                    </View>
                </View>

                {/* FOOTER */}
                <Text style={styles.footer}>
                    Generated by IKON Task Management System
                </Text>

            </Page>
        </Document>
    );
}
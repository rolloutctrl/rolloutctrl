import { Grid, Paper, Title } from "@mantine/core";
import { AuditLogsTable } from "../../AuditLogsTable";
import { AuditLogFilter } from "@/features/AuditLog/AuditLogFilter";

export const AuditLogsView = () => {
  return (
    <Grid columns={12}>
      <Grid.Col span={12}>
        <Paper radius="md" p={0} className="!overflow-clip" withBorder>
          <div className="flex items-center justify-between p-4">
            <Title order={1} fw={700} size="xl" ta="left">
              Audit Logs
            </Title>
          </div>
          <Grid.Col span={12}>
            <AuditLogFilter />
            <AuditLogsTable />
          </Grid.Col>
        </Paper>
      </Grid.Col>
    </Grid>
  );
};

import { useCallback, useEffect, useMemo, useState } from "react";
import { DataTable } from "@/components/components/data-table";
import { useToast } from "@/components/hooks/use-toast";
import { getMemberPlotRecords } from "../../services/memberPlotRecords";

// Constants
const DEFAULT_QUERY_PARAMS = {
  limit: 5,
};

const getColumns = () => [
  { accessorKey: "membershipNumber", header: "Membership No." },
  { accessorKey: "member.name", header: "Name" },
  { accessorKey: "plot.number", header: "Plot No." },
  { accessorKey: "status", header: "Status" },
];

const Home = () => {
  const [memberPlotRecords, setMemberPlotRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Memoized columns to prevent unnecessary re-renders
  const columns = useMemo(() => getColumns(), []);

  // Fetch member plot records
  const fetchMemberPlotRecords = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await getMemberPlotRecords(DEFAULT_QUERY_PARAMS);
      setMemberPlotRecords(response?.data?.data || []);
    } catch (error) {
      console.error("Error fetching member plot records:", error);
      toast({
        title: "Failed to Fetch Records",
        description:
          error?.response?.data?.message ||
          error.message ||
          "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Fetch records on mount
  useEffect(() => {
    fetchMemberPlotRecords();
  }, [fetchMemberPlotRecords]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full p-4">
      <DataTable
        className="bg-white rounded-md shadow-lg p-6"
        heading="Member Plot Records"
        columns={columns}
        data={memberPlotRecords}
        enableFilters={false}
        enableColumnVisibility={false}
        isLoading={isLoading}
        seeAllPath="/member-plot-records"
      />
    </div>
  );
};

export default Home;

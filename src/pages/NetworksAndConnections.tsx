"use client";

import React, { useState } from "react";
import { Link } from "react-router-dom";

import BottomNavbar from "@/components/bottom-navbar/bottom-navbar";
import { Badge } from "@/components/ui/badge";
import FilterButtonSvg from "@/components/svgs/filter-button";
import CrossIcon from "@/components/svgs/cross-icon";

import useFetchNetworksAndConnections from "@/hooks/useGetNetworks";
import FilterDrawer from "@/components/filter-drawer";
import ConnectionBox from "@/components/connection-box";

const NetworksAndConnections = () => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState<{
    event?: string;
    position?: string;
    city?: string;
    field?: string;
  }>({});

  const { data, isLoading, isError } =
    useFetchNetworksAndConnections(selectedFilters);

  if (isLoading) return <p className="mt-4 text-center"></p>;
  if (isError) return <p className="mt-4 text-center">Error loading data.</p>;

  const connections = data?.connections?.results || [];
  console.log("Filter data: ", data.filters);

  return (
    <>
      <main className="flex flex-col gap-2 px-4 py-4 mt-4">
        <div className="flex items-center justify-between">
          <h2 className="text-[#FFFFF] text-3xl font-semibold">
            My network ({data?.connections?.count || 0})
          </h2>
        </div>

        {/* Filter badges */}
        <div className="flex flex-wrap gap-2 mt-3">
          <Badge
            variant={"outline"}
            onClick={() => setIsFilterOpen(true)}
            className="px-0 cursor-pointer"
          >
            <span className="flex justify-center text-white border rounded-[29px] px-4 border-white items-center gap-2 font-semibold text-[0.9rem] h-[40px]">
              Filter <FilterButtonSvg />
            </span>
          </Badge>

          {Object.entries(selectedFilters).map(([key, value]) =>
            value ? (
              <Badge key={key} variant={"red"} className="px-0 mx-0">
                <span className="flex justify-center bg-[#ED2944] text-white border rounded-[29px] px-3 border-white items-center gap-2 font-semibold text-[0.85rem] h-[35px]">
                  {value}{" "}
                  <button
                    onClick={() =>
                      setSelectedFilters((prev) => {
                        const newFilters = { ...prev };
                        delete newFilters[key as keyof typeof prev];
                        return newFilters;
                      })
                    }
                  >
                    <CrossIcon />
                  </button>
                </span>
              </Badge>
            ) : null
          )}
        </div>

        {/* Connections grid */}
        <div className="flex-1 mt-6 overflow-y-auto">
          <div className="grid grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-4">
            {connections.length === 0 ? (
              <p className="col-span-2 text-center text-gray-400">
                No connections found.
              </p>
            ) : (
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              connections.map((conn: any) => (
                <Link
                  key={conn?.user?.id}
                  to={`/connected-user/${conn?.user?.id}`}
                  className="block"
                >
                  <div className="flex h-full">
                    <ConnectionBox
                      user={conn?.user}
                      base_event={conn?.base_event}
                    />
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </main>

      <FilterDrawer
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        onApply={(filters) => {
          setSelectedFilters(filters);
          setIsFilterOpen(false);
        }}
        filterOptions={{
          event: data.filters?.events || [],
          position: data.filters?.positions || [],
          field: data.filters?.fields || [],
          city: data.filters?.cities || [],
        }}
      />

      {!isFilterOpen && <BottomNavbar baseOnClick={() => {}} />}
    </>
  );
};

export default NetworksAndConnections;

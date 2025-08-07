"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import BottomNavbar from "@/components/bottom-navbar/bottom-navbar";
import { Badge } from "@/components/ui/badge";
import FilterButtonSvg from "@/components/svgs/filter-button";
import CrossIcon from "@/components/svgs/cross-icon";
import LogoutIcon from "@/components/svgs/logout-icon";

import useFetchNetworksAndConnections from "@/hooks/useGetNetworks";
import FilterDrawer from "@/components/filter-drawer";
import ConnectionBox from "@/components/connection-box";
import { useAuth } from "@/contexts/AuthContext";

const NetworksAndConnections = () => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState<{
    event?: string;
    position?: string;
    city?: string;
    field?: string;
  }>({});

  const { logout } = useAuth();
  const router = useRouter();

  const { data, isLoading, isError } =
    useFetchNetworksAndConnections(selectedFilters);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  if (isLoading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
        <p className="text-white text-lg">Loading your network...</p>
      </div>
    </div>
  );
  
  if (isError) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="text-red-500 text-6xl mb-4">⚠️</div>
        <h3 className="text-white text-xl font-semibold mb-2">Oops! Something went wrong</h3>
        <p className="text-gray-400 mb-4">We couldn't load your network connections</p>
        <button 
          onClick={() => window.location.reload()} 
          className="bg-[#ED2944] text-white px-6 py-2 rounded-lg hover:bg-[#cb1f38] transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  );

  const connections = data?.connections?.results || [];

  return (
    <>
      {/* Header with logout */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#232223]">
        <h2 className="text-[#FFFFF] text-2xl font-semibold">
          My network ({data?.connections?.count || 0})
        </h2>
        <button
          onClick={handleLogout}
          className="p-1 hover:bg-gray-800 rounded-full transition-colors"
          title="Logout"
        >
          <LogoutIcon size={20} />
        </button>
      </div>

      <main className="flex flex-col gap-2 px-4 py-4 pt-4">

      
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
               <div className="col-span-full flex flex-col items-center justify-center py-16">
                 <div className="text-center max-w-md mx-auto">
                   <div className="text-6xl mb-6">🤝</div>
                   <h3 className="text-white text-2xl font-semibold mb-3">
                     No connections yet
                   </h3>
                   <p className="text-gray-400 mb-6 leading-relaxed">
                     Start building your network by scanning QR codes at events or connecting with other professionals
                   </p>
                   <div className="space-y-3">
                     <div className="flex items-center justify-center gap-3 text-sm text-gray-300">
                       <div className="w-2 h-2 bg-[#ED2944] rounded-full"></div>
                       <span>Attend events and scan QR codes</span>
                     </div>
                     <div className="flex items-center justify-center gap-3 text-sm text-gray-300">
                       <div className="w-2 h-2 bg-[#ED2944] rounded-full"></div>
                       <span>Share your QR code with others</span>
                     </div>
                     <div className="flex items-center justify-center gap-3 text-sm text-gray-300">
                       <div className="w-2 h-2 bg-[#ED2944] rounded-full"></div>
                       <span>Build meaningful connections</span>
                     </div>
                   </div>
                 </div>
               </div>
             ) : (
               // eslint-disable-next-line @typescript-eslint/no-explicit-any
               connections.map((conn: any) => (
                 <Link
                   key={conn?.user?.id}
                   href={`/connected-user/${conn?.user?.id}`}
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
           event: data?.filters?.events || [],
           position: data?.filters?.positions || [],
           field: data?.filters?.fields || [],
           city: data?.filters?.cities || [],
         }}
       />

      {!isFilterOpen && <BottomNavbar baseOnClick={() => {}} />}
    </>
  );
};

export default NetworksAndConnections;

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
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#232223] via-[#1a1a1a] to-[#2d2d2d]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#ED2944] mx-auto mb-6"></div>
        <p className="text-white text-xl font-medium">Loading your network...</p>
        <p className="text-gray-400 text-sm mt-2">Gathering your connections</p>
      </div>
    </div>
  );
  
  if (isError) return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#232223] via-[#1a1a1a] to-[#2d2d2d]">
      <div className="text-center max-w-md mx-auto px-6">
        <div className="text-red-500 text-8xl mb-6">⚠️</div>
        <h3 className="text-white text-2xl font-bold mb-4">Oops! Something went wrong</h3>
        <p className="text-gray-400 mb-8 leading-relaxed">We couldn't load your network connections. Please check your connection and try again.</p>
        <button 
          onClick={() => window.location.reload()} 
          className="bg-[#ED2944] text-white px-8 py-3 rounded-full font-semibold hover:bg-[#cb1f38] transition-all duration-200 transform hover:scale-105 shadow-lg"
        >
          Try Again
        </button>
      </div>
    </div>
  );

  const connections = data?.connections?.results || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#232223] via-[#1a1a1a] to-[#2d2d2d]">
      {/* Desktop Layout */}
      <div className="hidden lg:block">
        <div className="max-w-7xl mx-auto px-8 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-r from-[#ED2944] to-[#ff6b7a] p-3 rounded-2xl shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white mb-1">My Network</h1>
                <p className="text-gray-400 text-lg">
                  {data?.connections?.count || 0} {data?.connections?.count === 1 ? 'connection' : 'connections'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsFilterOpen(true)}
                className="bg-white/10 backdrop-blur-sm border border-white/20 text-white px-6 py-3 rounded-full font-medium hover:bg-white/20 transition-all duration-200 flex items-center gap-2"
              >
                <FilterButtonSvg />
                Filter
              </button>
              
              <button
                onClick={handleLogout}
                className="bg-[#ED2944] text-white p-3 rounded-full hover:bg-[#cb1f38] transition-all duration-200 shadow-lg"
                title="Logout"
              >
                <LogoutIcon size={20} />
              </button>
            </div>
          </div>

          {/* Active Filters */}
          {Object.keys(selectedFilters).length > 0 && (
            <div className="mb-8">
              <h3 className="text-white font-semibold mb-3">Active Filters:</h3>
              <div className="flex flex-wrap gap-3">
                {Object.entries(selectedFilters).map(([key, value]) =>
                  value ? (
                    <Badge key={key} variant={"red"} className="px-0">
                      <span className="flex items-center gap-2 bg-[#ED2944] text-white px-4 py-2 rounded-full font-medium">
                        {value}
                        <button
                          onClick={() =>
                            setSelectedFilters((prev) => {
                              const newFilters = { ...prev };
                              delete newFilters[key as keyof typeof prev];
                              return newFilters;
                            })
                          }
                          className="hover:bg-white/20 rounded-full p-1 transition-colors"
                        >
                          <CrossIcon />
                        </button>
                      </span>
                    </Badge>
                  ) : null
                )}
              </div>
            </div>
          )}

          {/* Connections Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {connections.length === 0 ? (
              <div className="col-span-full">
                <div className="text-center max-w-2xl mx-auto py-20">
                  <div className="bg-gradient-to-r from-[#ED2944] to-[#ff6b7a] w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl">
                    <div className="text-4xl">🤝</div>
                  </div>
                  <h3 className="text-white text-3xl font-bold mb-4">
                    No connections yet
                  </h3>
                  <p className="text-gray-400 text-lg mb-8 leading-relaxed">
                    Start building your network by scanning QR codes at events or connecting with other professionals
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto">
                    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 text-center">
                      <div className="w-12 h-12 bg-[#ED2944] rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V6a1 1 0 00-1-1H5a1 1 0 00-1 1v1a1 1 0 001 1zm12 0h2a1 1 0 001-1V6a1 1 0 00-1-1h-2a1 1 0 00-1 1v1a1 1 0 001 1zM5 20h2a1 1 0 001-1v-1a1 1 0 00-1-1H5a1 1 0 00-1 1v1a1 1 0 001 1z" />
                        </svg>
                      </div>
                      <h4 className="text-white font-semibold mb-2">Attend Events</h4>
                      <p className="text-gray-400 text-sm">Scan QR codes at networking events</p>
                    </div>
                    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 text-center">
                      <div className="w-12 h-12 bg-[#ED2944] rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                        </svg>
                      </div>
                      <h4 className="text-white font-semibold mb-2">Share QR Code</h4>
                      <p className="text-gray-400 text-sm">Let others scan your QR code</p>
                    </div>
                    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 text-center">
                      <div className="w-12 h-12 bg-[#ED2944] rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                      </div>
                      <h4 className="text-white font-semibold mb-2">Build Connections</h4>
                      <p className="text-gray-400 text-sm">Create meaningful relationships</p>
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
                  className="block group"
                >
                  <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-6 h-full transition-all duration-300 hover:bg-white/10 hover:border-white/20 hover:transform hover:scale-105 hover:shadow-2xl">
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
      </div>

      {/* Mobile Layout */}
      <div className="lg:hidden">
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
      </div>

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
    </div>
  );
};

export default NetworksAndConnections;

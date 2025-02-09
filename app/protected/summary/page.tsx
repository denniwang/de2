"use client";

import { useEffect, useState } from "react";
import { Ticket } from "../tickets/types";
import { MapPin } from "lucide-react";
import React from "react";
import { handleSubmit } from "@/app/actions";
import { redirect } from "next/navigation";

// Update the SVG path components with precise node connections
const LeftToRightPath = () => (
  <svg
    className="absolute w-full h-48 -z-10 pointer-events-none"
    viewBox="0 0 800 200"
  >
    <path
      // Start from center of left node (x: node radius), curve to center of right node
      d="M 12 12 C 250 12, 550 188, 788 188"
      stroke="#8B4513"
      strokeWidth="4"
      fill="none"
      strokeDasharray="10,10"
      className="opacity-60 animate-draw-line"
    />
  </svg>
);

const RightToLeftPath = () => (
  <svg
    className="absolute w-full h-48 -z-10 pointer-events-none"
    viewBox="0 0 800 200"
  >
    <path
      // Start from center of right node, curve to center of left node
      d="M 788 12 C 550 12, 250 188, 12 188"
      stroke="#8B4513"
      strokeWidth="4"
      fill="none"
      strokeDasharray="10,10"
      className="opacity-60 animate-draw-line"
    />
  </svg>
);

// Add these styles to your global CSS or create them inline
const styles = `
  @keyframes drawLine {
    from {
      stroke-dashoffset: 1000;
    }
    to {
      stroke-dashoffset: 0;
    }
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: scale(0.9);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }

  .animate-draw-line {
    animation: drawLine 1.5s ease-out forwards;
  }

  .animate-fade-in {
    animation: fadeIn 0.5s ease-out forwards;
  }
`;

export default function SummaryPage() {
  const [approvedTickets, setApprovedTickets] = useState<Ticket[]>([]);
  const [rejectedTickets, setRejectedTickets] = useState<Ticket[]>([]);
  const [activeTicket, setActiveTicket] = useState<{
    ticket: Ticket;
    index: number;
    position: "left" | "right";
    rect: DOMRect;
    isClicked?: boolean;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Retrieve the tickets from localStorage
    const storedTickets = JSON.parse(localStorage.getItem("tickets") || "[]");

    // Filter the tickets based on approval status
    const approved = storedTickets.filter((t: Ticket) => t.approved);
    const rejected = storedTickets.filter((t: Ticket) => !t.approved);

    // Update the state with the filtered tickets
    setApprovedTickets(approved);
    setRejectedTickets(rejected);
  }, []);

  const handleRestore = (ticketToRestore: Ticket) => {
    const updatedTicket = { ...ticketToRestore, approved: true };
    setRejectedTickets((prev) =>
      prev.filter((t) => t.name !== ticketToRestore.name)
    );
    setApprovedTickets((prev) => [...prev, updatedTicket]);

    const allTickets = JSON.parse(localStorage.getItem("tickets") || "[]");
    const updatedTickets = allTickets.map((t: Ticket) =>
      t.name === ticketToRestore.name ? updatedTicket : t
    );
    localStorage.setItem("tickets", JSON.stringify(updatedTickets));
  };

  const handleRemove = (ticketToRemove: Ticket) => {
    const updatedTicket = { ...ticketToRemove, approved: false };
    setApprovedTickets((prev) =>
      prev.filter((t) => t.name !== ticketToRemove.name)
    );
    setRejectedTickets((prev) => [...prev, updatedTicket]);

    const allTickets = JSON.parse(localStorage.getItem("tickets") || "[]");
    const updatedTickets = allTickets.map((t: Ticket) =>
      t.name === ticketToRemove.name ? updatedTicket : t
    );
    setActiveTicket(null);
    localStorage.setItem("tickets", JSON.stringify(updatedTickets));
  };

  const handleSave = (index: number, updatedTicket: Ticket) => {
    const updatedTickets = [...approvedTickets];
    updatedTickets[index] = updatedTicket;
    setApprovedTickets(updatedTickets);

    const allTickets = JSON.parse(localStorage.getItem("tickets") || "[]");
    const updatedAllTickets = allTickets.map((t: Ticket) =>
      t.name === updatedTicket.name ? updatedTicket : t
    );
    localStorage.setItem("tickets", JSON.stringify(updatedAllTickets));
  };

  const PopupCard = () => {
    if (!activeTicket) return null;
    const { ticket, index, position, rect } = activeTicket;

    return (
      <div
        className="fixed z-50"
        style={{
          top: rect.top + rect.height / 2,
          left: position === "left" ? rect.left - 340 : rect.right + 20,
          transform: "translateY(-50%)",
        }}
      >
        <div className="w-80 bg-white/95 p-6 rounded-lg shadow-xl">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-500">
              {index + 1} of {approvedTickets.length + rejectedTickets.length}
            </span>
            <span
              className={`px-2 py-1 ${
                ticket.approved
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              } text-sm rounded`}
            >
              {ticket.approved ? "Accepted" : "Rejected"}
            </span>
          </div>
          <input
            className="font-semibold text-lg mb-2 w-full"
            value={ticket.name}
            onChange={(e) =>
              handleSave(index, { ...ticket, name: e.target.value })
            }
          />
          <textarea
            className="text-sm text-gray-600 mb-3 w-full"
            value={ticket.description}
            onChange={(e) =>
              handleSave(index, { ...ticket, description: e.target.value })
            }
          />
          {ticket.label && (
            <div className="flex items-center gap-2">
              <span className="px-2 py-1 bg-amber-100 text-brown-700 text-sm rounded-full">
                {ticket.label}
              </span>
            </div>
          )}
          <button
            onClick={() =>
              ticket.approved ? handleRemove(ticket) : handleRestore(ticket)
            }
            className={`mt-4 w-full ${
              ticket.approved
                ? "bg-red-600 hover:bg-red-500"
                : "bg-green-600 hover:bg-green-500"
            } text-white py-2 px-4 rounded-lg transition-colors`}
          >
            {ticket.approved ? "Reject" : "Accept"}
          </button>
        </div>
      </div>
    );
  };

  const handleNodeHover = (
    ticket: Ticket,
    index: number,
    event: React.MouseEvent,
    isEntering: boolean
  ) => {
    if (!isEntering) {
      if (!activeTicket?.isClicked) {
        setActiveTicket(null);
      }
      return;
    }

    if (activeTicket?.isClicked) return;

    const rect = event.currentTarget.getBoundingClientRect();
    setActiveTicket({
      ticket,
      index,
      position: index % 2 === 0 ? "right" : "left",
      rect,
    });
  };

  const handleNodeClick = (
    ticket: Ticket,
    index: number,
    event: React.MouseEvent
  ) => {
    const rect = event.currentTarget.getBoundingClientRect();

    if (activeTicket?.isClicked && activeTicket.index === index) {
      setActiveTicket(null);
    } else {
      setActiveTicket({
        ticket,
        index,
        position: index % 2 === 0 ? "right" : "left",
        rect,
        isClicked: true,
      });
    }
  };

  return (
    <>
      <style jsx global>
        {styles}
      </style>
      <div className="flex h-screen bg-[url('/desert-bg.jpg')] bg-cover bg-center">
        <div
          className="flex-1 p-8 overflow-y-auto bg-[#F7E3E1] backdrop-blur-sm"
          onClick={() => setActiveTicket(null)}
        >
          <h1 className="text-5xl font-bold mb-16 text-center text-brown-800 font-western drop-shadow-lg">
            TRANSCRIPT OVERVIEW
          </h1>

          <div className="relative max-w-4xl mx-auto">
            <div className="relative py-8">
              {/* Combine approved and rejected tickets */}
              {[...approvedTickets, ...rejectedTickets].map((ticket, index) => (
                <div
                  key={index}
                  className="relative mb-[6rem]"
                  style={{
                    animation: `fadeIn 0.5s ease-out forwards`,
                    animationDelay: `${index * 0.2}s`,
                    opacity: 0,
                  }}
                >
                  {index !== 0 && (
                    <div
                      className="absolute -top-36 left-0 right-0 h-72 overflow-visible pointer-events-none"
                      style={{
                        animation: `fadeIn 0.8s ease-out forwards`,
                        animationDelay: `${index * 0.2}s`,
                        opacity: 0,
                      }}
                    >
                      {index % 2 === 1 ? (
                        <LeftToRightPath />
                      ) : (
                        <RightToLeftPath />
                      )}
                    </div>
                  )}

                  <div
                    className={`flex items-center ${
                      index % 2 === 0 ? "flex-row" : "flex-row-reverse"
                    }`}
                  >
                    <div className="block group w-24">
                      <div
                        className={`w-24 h-24 bg-amber-50 rounded-full flex items-center justify-center border-4 ${
                          ticket.approved
                            ? "border-amber-200 hover:border-amber-400"
                            : "border-red-400 hover:border-red-500"
                        } transition-all cursor-pointer z-20 shadow-lg hover:shadow-xl transform hover:scale-105`}
                        onClick={(e) => {
                          handleNodeClick(ticket, index, e);
                          e.stopPropagation();
                        }}
                        onMouseEnter={(e) =>
                          handleNodeHover(ticket, index, e, true)
                        }
                        onMouseLeave={(e) =>
                          handleNodeHover(ticket, index, e, false)
                        }
                      >
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-amber-200 text-2xl font-bold"></span>
                        </div>
                        <MapPin
                          className={
                            ticket.approved ? "text-amber-200" : "text-red-400"
                          }
                          size={48}
                        />
                      </div>
                    </div>

                    <div className="flex-1 min-w-[200px] max-w-[400px]" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Add Submit Button */}
          <div className="flex justify-center mb-8">
            <button
              onClick={async () => {
                setIsLoading(true);
                const selectedProject = JSON.parse(
                  localStorage.getItem("selectedProject") || "{}"
                );
                const result = await handleSubmit(
                  approvedTickets,
                  selectedProject
                );
                if (result) {
                  redirect(result.success.link);
                }
                setIsLoading(false);
              }}
              className="font-retro h-16 px-12 py-2 bg-[#0F2E4A] text-white hover:bg-[#0F2E4A]-700 transition-colors font-western text-lg shadow-md hover:shadow-lg"
            >
              {isLoading ? "Submitting..." : "Submit Roadmap"}
            </button>
          </div>
        </div>
      </div>
      <PopupCard />
    </>
  );
}

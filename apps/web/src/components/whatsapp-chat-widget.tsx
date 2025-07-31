// components/whatsapp-chat-widget.tsx
"use client";

import { useState, useRef, useEffect } from 'react';
import { FaWhatsapp, FaPaperPlane } from "react-icons/fa";
import { X, Phone, Check, CheckCheck } from 'lucide-react';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";

interface Message {
  id: string;
  text: string;
  timestamp: Date;
  isUser: boolean;
  status: 'sent' | 'delivered' | 'read';
}

interface WhatsAppChatWidgetProps {
  phoneNumber?: string;
  businessName?: string;
}

export default function WhatsAppChatWidget({ 
  phoneNumber = "8613910989120",
  businessName = "Real Hakuba"
}: WhatsAppChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [hasOpenedWhatsApp, setHasOpenedWhatsApp] = useState(false); // 新增：跟踪是否已打开过 WhatsApp
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: `👋 Hello! Welcome to ${businessName}. How can I help you today?`,
      timestamp: new Date(),
      isUser: false,
      status: 'read'
    }
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 预设的快速回复消息
  const quickReplies = [
    "Hi! I'm interested in booking accommodation",
    "What are your check-in/check-out times?",
    "Do you have availability for my dates?",
    "Can you help me with my reservation?",
    "I have a question about the property"
  ];

  // 自动回复模板
  const autoReplies = [
    "Thank you for your message! I'll get back to you shortly.",
    "Got it! Let me check that information for you.",
    "Thanks for reaching out! I'll help you with that right away.",
    "Perfect! I'll look into this and respond soon.",
    "Received! I'll provide you with the details shortly."
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendToWhatsApp = (text: string) => {
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, '_blank');
    setHasOpenedWhatsApp(true);
  };

  const addMessage = (text: string, isUser: boolean = true, sendToWA: boolean = false) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      text,
      timestamp: new Date(),
      isUser,
      status: 'sent'
    };

    setMessages(prev => [...prev, newMessage]);

    // 模拟消息状态变化
    setTimeout(() => {
      setMessages(prev => prev.map(msg => 
        msg.id === newMessage.id ? { ...msg, status: 'delivered' } : msg
      ));
    }, 1000);

    setTimeout(() => {
      setMessages(prev => prev.map(msg => 
        msg.id === newMessage.id ? { ...msg, status: 'read' } : msg
      ));
    }, 2000);

    // 只在指定时或第一次发消息时发送到 WhatsApp
    if (isUser && (sendToWA || !hasOpenedWhatsApp)) {
      sendToWhatsApp(text);
    }

    // 如果是用户消息，模拟自动回复
    if (isUser) {
      setTimeout(() => {
        const randomReply = autoReplies[Math.floor(Math.random() * autoReplies.length)];
        addMessage(randomReply, false, false);
      }, 3000);
    }
  };

  const handleSendMessage = (msg?: string, sendToWA: boolean = false) => {
    const textToSend = msg || message;
    if (!textToSend.trim()) return;

    addMessage(textToSend, true, sendToWA);
    setMessage('');
  };

  const handleQuickReply = (reply: string) => {
    addMessage(reply, true, !hasOpenedWhatsApp); // 快速回复时，如果没打开过 WhatsApp 就发送
  };

  const handleDirectCall = () => {
    const whatsappUrl = `https://wa.me/${phoneNumber}`;
    window.open(whatsappUrl, '_blank');
    setHasOpenedWhatsApp(true);
  };

  // 发送所有消息到 WhatsApp
  const sendAllToWhatsApp = () => {
    const userMessages = messages.filter(msg => msg.isUser).map(msg => msg.text);
    const allText = userMessages.join('\n\n');
    if (allText) {
      sendToWhatsApp(`Previous messages:\n\n${allText}`);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  const MessageStatus = ({ status }: { status: Message['status'] }) => {
    switch (status) {
      case 'sent':
        return <Check size={12} className="text-gray-400" />;
      case 'delivered':
        return <CheckCheck size={12} className="text-gray-400" />;
      case 'read':
        return <CheckCheck size={12} className="text-blue-500" />;
      default:
        return null;
    }
  };

  return (
    <>
      {/* 悬浮按钮 - 只在移动端显示，调整位置避开 MobileFooter */}
      <button
        onClick={() => setIsOpen(true)}
        className="md:hidden fixed bottom-24 right-6 z-50 w-14 h-14 bg-green-500 hover:bg-green-600 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110"
        aria-label="Chat on WhatsApp"
      >
        <FaWhatsapp size={24} className="text-white" />
      </button>

      {/* WhatsApp 聊天 Drawer */}
      <Drawer open={isOpen} onOpenChange={setIsOpen}>
        <DrawerContent className="max-h-[85vh]">
          <DrawerHeader className="bg-green-500 text-white pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <FaWhatsapp size={20} />
                </div>
                <div>
                  <DrawerTitle className="text-lg font-semibold text-white">
                    {businessName}
                  </DrawerTitle>
                  <p className="text-sm text-green-100">
                    Online • Usually replies within minutes
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-white/20 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          </DrawerHeader>

          {/* 聊天消息区域 */}
          <div className="flex-1 p-4 space-y-4 max-h-80 overflow-y-auto bg-gray-50">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    msg.isUser
                      ? 'bg-green-500 text-white rounded-br-sm'
                      : 'bg-white text-gray-800 rounded-bl-sm shadow-sm'
                  }`}
                >
                  <p className="text-sm leading-relaxed">{msg.text}</p>
                  <div className={`flex items-center justify-end gap-1 mt-1 ${
                    msg.isUser ? 'text-green-100' : 'text-gray-400'
                  }`}>
                    <span className="text-xs">{formatTime(msg.timestamp)}</span>
                    {msg.isUser && <MessageStatus status={msg.status} />}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* 快速回复选项 */}
          {messages.length === 1 && (
            <div className="px-4 py-2 bg-white border-t border-gray-200">
              <p className="text-xs text-gray-500 font-medium mb-2">Quick replies:</p>
              <div className="flex flex-wrap gap-2">
                {quickReplies.slice(0, 3).map((reply, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickReply(reply)}
                    className="text-xs px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-full border border-gray-300 transition-colors"
                  >
                    {reply}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 输入区域 */}
          <div className="border-t border-gray-200 bg-white p-4 space-y-3">
            {/* 顶部按钮区域 */}
            <div className="flex gap-2">
              {!hasOpenedWhatsApp ? (
                <button
                  onClick={handleDirectCall}
                  className="flex-1 flex items-center justify-center gap-2 p-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors text-sm"
                >
                  <Phone size={14} />
                  <span className="font-medium">Start WhatsApp Chat</span>
                </button>
              ) : (
                <>
                  <button
                    onClick={handleDirectCall}
                    className="flex-1 flex items-center justify-center gap-2 p-2 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg transition-colors text-sm"
                  >
                    <Phone size={14} />
                    <span className="font-medium">Open WhatsApp</span>
                  </button>
                  <button
                    onClick={sendAllToWhatsApp}
                    className="flex-1 flex items-center justify-center gap-2 p-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors text-sm"
                  >
                    <FaPaperPlane size={12} />
                    <span className="font-medium">Send to WhatsApp</span>
                  </button>
                </>
              )}
            </div>

            {/* 自定义消息输入 */}
            <div className="relative">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message here..."
                className="w-full p-3 pr-12 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                rows={2}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={!message.trim()}
                className="absolute right-2 bottom-2 p-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-full transition-colors"
              >
                <FaPaperPlane size={12} />
              </button>
            </div>

            <p className="text-xs text-gray-500 text-center">
              {!hasOpenedWhatsApp 
                ? "First message will open WhatsApp to start the conversation"
                : "Continue chatting here. Use 'Send to WhatsApp' to sync messages"
              }
            </p>
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}
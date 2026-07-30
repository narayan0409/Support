import re

with open('frontend/src/pages/ChatPage.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix 1: Close the workspace metrics inner div properly
old1 = '<div className="rounded-3xl bg-slate-900/70 px-4 py-3 text-sm text-slate-200">Model: GPT-5</div>\n          </div>\n        </aside>'
new1 = '<div className="rounded-3xl bg-slate-900/70 px-4 py-3 text-sm text-slate-200">Model: GPT-5</div>\n            </div>\n          </div>\n        </aside>'
content = content.replace(old1, new1)

# Fix 2: Close the header div properly
old2 = 'Deep research</span>\n              </div>\n          </div>\n\n          <div className="glass-panel flex min-h-[560px]'
new2 = 'Deep research</span>\n              </div>\n            </div>\n          </div>\n\n          <div className="glass-panel flex min-h-[560px]'
content = content.replace(old2, new2)

# Fix 3: Close the Stop/Regenerate button div
old3 = 'Regenerate</button>\n              </div>\n\n            <div className="flex flex-1'
new3 = 'Regenerate</button>\n              </div>\n            </div>\n\n            <div className="flex flex-1'
content = content.replace(old3, new3)

# Fix 4: Close the send button div and the two parent divs properly
old4 = 'disabled:opacity-60"\n                  >\n                    {isLoading ? "Generating..." : "Send message"}\n                  </button>\n                </div>\n            </div>\n\n          <div className="grid gap-4'
new4 = 'disabled:opacity-60"\n                  >\n                    {isLoading ? "Generating..." : "Send message"}\n                  </button>\n                </div>\n              </div>\n            </div>\n          </div>\n\n          <div className="grid gap-4'
content = content.replace(old4, new4)

with open('frontend/src/pages/ChatPage.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("JSX fixed successfully!")

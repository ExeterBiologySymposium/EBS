# EBS administration screen

Status: approved October 31, 2026.

Use existing EBS typography, crimson controls, borders, focus styles and mobile spacing. Account links to EBS administration only after verified Team access. Denied/loading/error states show no participant data.

Administration has Pending, Accepted and Invitations views plus one Add or invite participant form. Email lookup shows the verified account and Add action, or offers an email invitation. Pending is the default destination. Explain immediate Accepted access versus access after invitation acceptance. Show capacity as Space available, A new list will be created or Capacity reached. Server rechecks capacity at submit.

Deduplicated participant rows show identity, join date and status. Pending rows offer Accept participant; partially completed moves show Accepted — cleanup needed with Retry cleanup. Actions announce results, retain input on failure and preserve keyboard focus. Paginate unified lists. Stack rows on small screens without horizontal overflow.

Explicit Team organization settings select only the verified Team org and use stable Clerk hash routing. Staff invitation controls follow Clerk permission checks and explain administration access. Keep staff invitations separate from participant destinations. No numbered organization selection is exposed.

# Terms of Hosts

## General flow

```mermaid
gantt
   title Timeline of Terms of Hosts

   section Developer
   Terms of Hosts live                                                              : 2024-01-15, 1d
   Day 40 closeChainsWithOldPendingParticipants live                                : 2024-02-24, 1d
   Day 40 Run migrations (Save list hosts, draft loops, Set host to participant)    : 2024-02-24, 1d
   Day 65 Delete loops w zero hosts toh-accepted with no participants     : 2024-03-20, 1d

   section Email
   Day 14 Email accept toh                                     : 2024-01-29, 1d
   Day 21 Email accept toh                                     : 2024-02-05, 1d
   Day 30 Email loop +1 warn host set to participant           : 2024-02-14, 1d
   Day 30 Email warn host set loop draft                       : 2024-02-14, 1d
   Day 56 Email reminder hosts drafted loops                   : 2024-03-11, 1d
   Day 65 Email participants of drafted loops to become host   : 2024-03-20, 1d
```

**Migrations for Terms of Hosts (should be run 40 days after ToH start)**

After ToH start there will be steps to ease the migration:

- Day 14 & 21: Email all unaccepted hosts to accept the toh.
- Day 30:
  1.  Email unaccepted hosts that we will set them as participant, in Loops where +1 hosts have accepted toh.
  2.  Email all hosts in Loops, where all hosts have not accepted toh, that their Loop will be set to draft.
- Day 40: Run migration
  1.  "List hosts, in loops where none of the hosts have accepted the toh" save for day 56
  2.  "Draft all Loops where all the hosts have not accepted the toh"
  3.  "Set all the hosts who have not accepted the toh, in a Loop where +1 hosts have accepted toh, as participant."
  4.  Uncomment cron func "closeChainsWithOldPendingParticipants"
- Day 56: Send a reminder to hosts from loops, where all have not accepted toh
- Day 65: Send an email to all participants asking if they what to become host for this loop.

## Someone denies the Terms of Hosts

```mermaid

flowchart TB
   Start(Start) --> A[Someone denies the Terms of Hosts]
   A --> B[They are demoted from host to participant in all connected Loops]
   B --> C[From those affected Loops those which do not contain +1 host as put to draft]
   C --> End(End)
```

See code for more details [users.go:307 ~](/server/internal/controllers/users.go:307)

# Email flow diagrams

## Find abandoned loops

```mermaid

flowchart TD
   subgraph SB1[Loop is abandoned]
      SA[Someone has requested to join the loop] --> SB[/60 days later/]
      SB --> |Nothing happened| SC[Email is sent to all hosts reminding\nto accept or decline 'join requests']
      SC --> SD[/30 days later/]
      SD --> SE{A host has responded\nto a 'join request'}
      SE --> |True| S0[Loop is active]
      SE --> |False| SF{Host has not logged-in\nin the last 30 days}
      SF --> |True| S0
      SF --> |False| S1[Loop is abandoned]
   end
   Start --> SB1
   SB1 --> |Loop is abandoned| A[Loop is set to draft and closed]
   A --> End

```

## Email resend #578

Email resends happen on these templates:

- an_admin_approved_your_join_request.gohtml
- an_admin_denied_your_join_request.gohtml
- approve_reminder.gohtml
- poke.gohtml
- register_verification.gohtml
- someone_is_interested_in_joining_your_loop.gohtml

```mermaid
flowchart TD
   ST(Start) --> A
    A[Send email to user]--> B{sent status}
    B -->|Sent| B1[OK]
    B -->|Not sent| B2[Save email in database<sup>1</sup>]
    B2 --> C[/One day later/]
    C -->E{Has sent email\n3 times and failed}
    E --> |NO| D[Send email again]
    D --> B
    E --> F[Send error email to\nclothingloop.org]
    F --> G(END)
```

<sup>1</sup> The emails can be found in the database following the first send failure in the database table `mail_retries`.

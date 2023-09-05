# In-App notification flows

## Block sending too many notifications

```mermaid

flowchart TB
   Start(Start) --> A[A notification to be sent]
   A --> S1

   subgraph Q[Queue]
      direction TB
      S1["Add a notification to the waiting list ¹"] --> S2{Is similar notification\nin queue?}
      S2 --> |"Yes"| S3["Remove earlier notification\nand continue ³"]
      S2 --> |"No ²"| S4[/5 minutes later/]
      S3 --> S4
      S4 --> S5{"Is the notification\nremoved? ⁴"}
      S5 -. No .-> S6["Send notification ⁵"]
      S3 -. To earlier\nnotification\nthat is similar .-> S5
   end
   S5 -. Yes .-> End
   S6 --> End(End)
```

¹ Adds **NotifyID** to the KV store

² Adds **Tag** to the KV store

³ Removes the old **NotifyID** from the KV store and edits **Tag** to link to the new **NotifyID**

⁴ Checks if the **NotifyID** still exists

⁵ Removes both **Tag** & **NotifyID** from the KV store

```mermaid
flowchart
   Redis[("In memory\nkey-value store ⁶")]
```

⁶ This contains;

| Type     | Key                                                                                                          | Value                                |
| -------- | ------------------------------------------------------------------------------------------------------------ | ------------------------------------ |
| Tag      | searchable string that relates to the notification; `tag_routeorderchange_<chain_id>_<original_route_index>` | the key of the definition below      |
| NotifyID | id of the notification run (if not found the notification is deemed to be deleted); `notifyid_<uuid>`        | boolean (this should always be true) |

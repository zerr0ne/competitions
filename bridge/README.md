## Running the Daemon

1. Install Forever
    ```
    npm install forever -g
    ```

2. Run two instances of Parity or other Ethereum nodes, one with Main chain and other with Kovan chain. Use different ports for each. Make sure the oracle address account is unlocked in the main chain node. (Use this [guide](https://github.com/melonproject/docs/blob/master/Software%20Architecture/hosting.md) if you wish to configure Parity nodes as Daemons)
    ```
    npm install
    ```

3. Update config.js with corresponding ports

4. Run the daemon using
    ```
    forever start daemon.js
    ```
5. In case some transactions fail due to unexpected issues like Parity node crashes, out of balance, The events
are saved to the db. Run backlog.js to process the failed events.

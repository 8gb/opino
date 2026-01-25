'use client';
import React, { Component, createContext } from "react";
import authService from "./services/auth";

export const UserContext = createContext({ user: null });
class UserProvider extends Component {
  state = {
    user: 'loading'
  };

  componentDidMount = () => {
    this.unsubscribe = authService.onAuthStateChanged(userAuth => {
      console.log(JSON.stringify(userAuth))
      this.setState({ user: userAuth});
    });
  };

  componentWillUnmount = () => {
    if (this.unsubscribe) this.unsubscribe();
  }

  render() {
    return (
      <UserContext.Provider value={this.state.user}>
        {this.props.children}
      </UserContext.Provider>
    );
  }
}
export default UserProvider;

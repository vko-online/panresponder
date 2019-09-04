import React, { useState, useCallback, useEffect } from 'react'
import { StyleSheet, Text, View, PanResponder, Animated, PanResponderGestureState, GestureResponderEvent, Easing } from 'react-native'
import { useAnimation } from './hook'

const initialPosition = { x: 0, y: 0 }
export default function App () {
  const [value] = useState(new Animated.Value(0))
  const [pos, setPos] = useState(new Animated.ValueXY(initialPosition))
  const [position, setPosition] = useState(initialPosition)

  const handleMove = useCallback((
    evt: GestureResponderEvent,
    gestureState: PanResponderGestureState
  ) => {
    setPosition({
      x: position.x + gestureState.dx,
      y: position.y + gestureState.dy
    })
  }, [position, setPosition])

  const handlePress = useCallback(() => {
    Animated.timing(value, {
      toValue: 1,
      duration: 300
    }).start()
  }, [value])

  // const onMove = useCallback(() => {
  //   setPos()
  // })

  // const handleRelease = useCallback(() => {
  //   const { x, y } = pos
  //   Animated.timing(value, {
  //     toValue: 0,
  //     duration: 200
  //   }).start()
  //   Animated.event([
  //     { dx: pos.x, dy: pos.y }
  //   ], {
  //     // listener: onMove
  //   })
  //   Animated.timing(
  //     this.pan,
  //     {
  //       toValue: { x, y },
  //       duration: 600
  //     }
  // ).start(() => {
  //     // animation finished
  // })
  // }, [value])
  const pan = PanResponder.create({
    onStartShouldSetPanResponder: (evt, gestureState) => true,
    onStartShouldSetPanResponderCapture: (evt, gestureState) => true,
    onMoveShouldSetPanResponder: (evt, gestureState) => true,
    onMoveShouldSetPanResponderCapture: (evt, gestureState) => true,
    onPanResponderGrant: handlePress,
    onPanResponderMove: handleMove,
    onPanResponderTerminationRequest: (evt, gestureState) => true,
    // onPanResponderRelease: handleRelease,
    onPanResponderTerminate: (evt, gestureState) => {
      // Another component has become the responder, so this gesture
      // should be cancelled
    },
    onShouldBlockNativeResponder: (evt, gestureState) => {
      // Returns whether this component should block native components from becoming the JS
      // responder. Returns true by default. Is currently only supported on android.
      return true
    }
  })

  const backgroundColor = value.interpolate({
    inputRange: [0, 1],
    outputRange: ['#333', '#ccc']
  })

  return (
    <View style={s.container}>
      <Text>Open up App.tsx to start working on your app!</Text>
      <Animated.View
        style={[s.box, { backgroundColor, top: position.y, left: position.x }]}
        {...pan.panHandlers}
      />
    </View>
  )
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center'
  },
  box: {
    width: 60,
    height: 60,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#444',
    backgroundColor: 'pink'
  }
})
